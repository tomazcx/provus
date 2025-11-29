import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AplicacaoModel } from '../config/models/aplicacao.model';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import { AvaliacaoModel } from '../config/models/avaliacao.model';
import { ConfiguracaoAvaliacaoModel } from '../config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from '../config/models/configuracoes-gerais.model';
import { ConfiguracoesRandomizacaoModel } from '../config/models/configuracoes-randomizacao.model';
import { ConfiguracoesSegurancaModel } from '../config/models/configuracoes-seguranca.model';
import { PunicaoPorOcorrenciaModel } from '../config/models/punicao-por-ocorrencia.model';
import { ConfiguracaoNotificacaoModel } from '../config/models/configuracao-notificacao.model';

@Injectable()
export class AplicacaoRepository extends Repository<AplicacaoModel> {
  constructor(private dataSource: DataSource) {
    super(AplicacaoModel, dataSource.createEntityManager());
  }

  async createAplicacao(
    dto: CreateAplicacaoDto,
    codigoAcesso: string,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const avaliacaoEntity = await manager.findOne(AvaliacaoModel, {
        where: {
          id: dto.avaliacaoId,
          item: { avaliador: { id: avaliador.id } },
        },
        relations: [
          'configuracaoAvaliacao',
          'configuracaoAvaliacao.configuracoesGerais',
          'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
          'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
          'configuracaoAvaliacao.configuracoesSeguranca',
          'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
          'configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
        ],
      });

      if (!avaliacaoEntity) {
        throw new BadRequestException(
          `Avaliação com ID ${dto.avaliacaoId} não encontrada.`,
        );
      }

      const snapshotConfig = await this._snapshotConfiguration(
        manager,
        avaliacaoEntity.configuracaoAvaliacao,
      );

      const aplicacao = new AplicacaoModel();
      aplicacao.codigoAcesso = codigoAcesso;
      aplicacao.avaliacao = avaliacaoEntity;
      aplicacao.configuracao = snapshotConfig;

      const configGerais = snapshotConfig.configuracoesGerais;
      const tempoMaximoMs = configGerais.tempoMaximo * 60 * 1000;
      const now = new Date();

      if (dto.dataInicio && dto.estado === EstadoAplicacaoEnum.AGENDADA) {
        const dataInicio = new Date(dto.dataInicio);
        if (isNaN(dataInicio.getTime())) {
          throw new BadRequestException('Data de início inválida.');
        }
        aplicacao.estado = EstadoAplicacaoEnum.AGENDADA;
        aplicacao.dataInicio = dataInicio;
        aplicacao.dataFim = new Date(dataInicio.getTime() + tempoMaximoMs);
      } else if (
        configGerais.tipoAplicacao === TipoAplicacaoEnum.AGENDADA &&
        configGerais.dataAgendamento
      ) {
        aplicacao.estado = EstadoAplicacaoEnum.AGENDADA;
        aplicacao.dataInicio = configGerais.dataAgendamento;
        aplicacao.dataFim = new Date(
          configGerais.dataAgendamento.getTime() + tempoMaximoMs,
        );
      } else {
        if (dto.estado === EstadoAplicacaoEnum.EM_ANDAMENTO) {
          aplicacao.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
          aplicacao.dataInicio = now;
          aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);
        } else {
          aplicacao.estado = EstadoAplicacaoEnum.CRIADA;
          aplicacao.dataInicio = now;
          aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);
        }
      }

      const savedAplicacao = await manager.save(aplicacao);
      return savedAplicacao.id;
    });
  }

  private async _snapshotConfiguration(
    manager: EntityManager,
    original: ConfiguracaoAvaliacaoModel,
  ): Promise<ConfiguracaoAvaliacaoModel> {
    const novasGerais = new ConfiguracoesGeraisModel();
    Object.assign(novasGerais, {
      ...original.configuracoesGerais,
      id: undefined,
    });
    const savedGerais = await manager.save(novasGerais);

    if (
      original.configuracoesGerais.configuracoesRandomizacao &&
      original.configuracoesGerais.configuracoesRandomizacao.length > 0
    ) {
      for (const rule of original.configuracoesGerais
        .configuracoesRandomizacao) {
        const novaRule = new ConfiguracoesRandomizacaoModel();
        novaRule.tipo = rule.tipo;
        novaRule.dificuldade = rule.dificuldade;
        novaRule.quantidade = rule.quantidade;
        novaRule.configuracoesGerais = savedGerais;
        novaRule.poolDeQuestoes = rule.poolDeQuestoes;
        await manager.save(novaRule);
      }
    }

    const novasSeguranca = new ConfiguracoesSegurancaModel();
    Object.assign(novasSeguranca, {
      ...original.configuracoesSeguranca,
      id: undefined,
      punicoes: undefined,
      notificacoes: undefined,
    });
    const savedSeguranca = await manager.save(novasSeguranca);

    if (
      original.configuracoesSeguranca.punicoes &&
      original.configuracoesSeguranca.punicoes.length > 0
    ) {
      const novasPunicoes = original.configuracoesSeguranca.punicoes.map(
        (p) => {
          const novaPunicao = new PunicaoPorOcorrenciaModel();
          Object.assign(novaPunicao, {
            ...p,
            id: undefined,
            configuracaoSeguranca: savedSeguranca,
          });
          return novaPunicao;
        },
      );
      await manager.save(novasPunicoes);
    }

    if (
      original.configuracoesSeguranca.notificacoes &&
      original.configuracoesSeguranca.notificacoes.length > 0
    ) {
      const novasNotificacoes =
        original.configuracoesSeguranca.notificacoes.map((n) => {
          const novaNotificacao = new ConfiguracaoNotificacaoModel();
          novaNotificacao.tipoNotificacao = n.tipoNotificacao;
          novaNotificacao.configuracaoSeguranca = savedSeguranca;
          return novaNotificacao;
        });
      await manager.save(novasNotificacoes);
    }

    const novaConfig = new ConfiguracaoAvaliacaoModel();
    novaConfig.configuracoesGerais = savedGerais;
    novaConfig.configuracoesSeguranca = savedSeguranca;

    return await manager.save(novaConfig);
  }

  async updateAplicacao(
    id: number,
    avaliacao: AvaliacaoModel,
    estado: EstadoAplicacaoEnum,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: {
          id,
          avaliacao: { item: { avaliador: { id: avaliador.id } } },
        },
        relations: ['configuracao', 'configuracao.configuracoesGerais'],
      });

      if (!aplicacao) {
        throw new BadRequestException('Aplicação não encontrada');
      }

      const estadoAnterior = aplicacao.estado;
      const now = new Date();

      aplicacao.estado = estado;

      if (estado === EstadoAplicacaoEnum.PAUSADA) {
        if (estadoAnterior !== EstadoAplicacaoEnum.PAUSADA) {
          aplicacao.pausedAt = now;
        }
      } else {
        aplicacao.pausedAt = null;
        const configGerais = aplicacao.configuracao.configuracoesGerais;

        if (
          estado === EstadoAplicacaoEnum.EM_ANDAMENTO &&
          estadoAnterior === EstadoAplicacaoEnum.PAUSADA
        ) {
          if (aplicacao.pausedAt) {
            const pauseDurationMs =
              now.getTime() - aplicacao.pausedAt.getTime();
            const newEndTime = new Date(
              aplicacao.dataFim.getTime() + pauseDurationMs,
            );
            aplicacao.dataFim = newEndTime;
          }
        } else if (
          estado === EstadoAplicacaoEnum.EM_ANDAMENTO &&
          (estadoAnterior === EstadoAplicacaoEnum.CRIADA ||
            estadoAnterior === EstadoAplicacaoEnum.AGENDADA)
        ) {
          const tempoMaximoMs = configGerais.tempoMaximo * 60 * 1000;
          aplicacao.dataInicio = now;
          aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);
        }
      }

      await manager.save(aplicacao);
      return aplicacao.id;
    });
  }

  async findAll(avaliadorId: number): Promise<AplicacaoModel[]> {
    return this.find({
      where: {
        avaliacao: {
          item: {
            avaliador: { id: avaliadorId },
          },
        },
      },
      relations: [
        'avaliacao',
        'avaliacao.item',
        'configuracao',
        'configuracao.configuracoesGerais',
        'configuracao.configuracoesSeguranca',
      ],
    });
  }

  async findById(
    id: number,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoModel | null> {
    return this.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      relations: [
        'avaliacao',
        'avaliacao.item',
        'avaliacao.arquivos',
        'avaliacao.arquivos.arquivo',
        'avaliacao.arquivos.arquivo.item',
        'avaliacao.questoes',
        'avaliacao.questoes.questao',
        'avaliacao.questoes.questao.item',
        'avaliacao.questoes.questao.alternativas',
        'configuracao',
        'configuracao.configuracoesGerais',
        'configuracao.configuracoesGerais.configuracoesRandomizacao',
        'configuracao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'configuracao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.item',
        'configuracao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
        'configuracao.configuracoesSeguranca',
        'configuracao.configuracoesSeguranca.punicoes',
        'configuracao.configuracoesSeguranca.notificacoes',
      ],
    });
  }

  async deleteAplicacao(id: number, avaliador: AvaliadorModel): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: {
          id,
          avaliacao: { item: { avaliador: { id: avaliador.id } } },
        },
        relations: ['configuracao'],
      });

      if (!aplicacao) {
        throw new BadRequestException('Aplicação não encontrada');
      }

      await manager.delete(AplicacaoModel, { id });

      if (aplicacao.configuracao) {
        const configAvaliacaoId = aplicacao.configuracao.id;

        const configSnapshot = await manager.findOne(
          ConfiguracaoAvaliacaoModel,
          {
            where: { id: configAvaliacaoId },
            relations: ['configuracoesGerais', 'configuracoesSeguranca'],
          },
        );

        if (configSnapshot) {
          const gerais = configSnapshot.configuracoesGerais;
          const seguranca = configSnapshot.configuracoesSeguranca;

          if (gerais) {
            const randomizacoes = await manager.find(
              ConfiguracoesRandomizacaoModel,
              {
                where: { configuracoesGerais: { id: gerais.id } },
                relations: ['poolDeQuestoes'],
              },
            );

            for (const r of randomizacoes) {
              if (r.poolDeQuestoes && r.poolDeQuestoes.length > 0) {
                r.poolDeQuestoes = [];
                await manager.save(r);
              }
            }
            await manager.delete(ConfiguracoesRandomizacaoModel, {
              configuracoesGerais: { id: gerais.id },
            });
          }

          if (seguranca) {
            await manager.delete(PunicaoPorOcorrenciaModel, {
              configuracoesSegurancaId: seguranca.id,
            });
            await manager.delete(ConfiguracaoNotificacaoModel, {
              configuracoesSegurancaId: seguranca.id,
            });
          }

          await manager.delete(ConfiguracaoAvaliacaoModel, {
            id: configAvaliacaoId,
          });

          if (gerais) {
            await manager.delete(ConfiguracoesGeraisModel, { id: gerais.id });
          }
          if (seguranca) {
            await manager.delete(ConfiguracoesSegurancaModel, {
              id: seguranca.id,
            });
          }
        }
      }
    });
  }
}
