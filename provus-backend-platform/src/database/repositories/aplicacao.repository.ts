import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AplicacaoModel } from '../config/models/aplicacao.model';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import { AvaliacaoModel } from '../config/models/avaliacao.model';
import { ConfiguracoesGeraisModel } from '../config/models/configuracoes-gerais.model';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import { SubmissaoModel } from '../config/models/submissao.model';

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
        relations: ['configuracaoAvaliacao.configuracoesGerais'],
      });

      if (!avaliacaoEntity) {
        throw new BadRequestException(
          `Avaliação com ID ${dto.avaliacaoId} não encontrada.`,
        );
      }

      const aplicacao = new AplicacaoModel();
      aplicacao.codigoAcesso = codigoAcesso;
      aplicacao.avaliacao = avaliacaoEntity;

      const configGerais =
        avaliacaoEntity.configuracaoAvaliacao.configuracoesGerais;
      const tempoMaximoMs = configGerais.tempoMaximo * 60 * 1000;

      if (configGerais.tipoAplicacao === TipoAplicacaoEnum.AGENDADA) {
        if (!configGerais.dataAgendamento) {
          throw new BadRequestException(
            'A avaliação é do tipo "Agendada", mas não possui uma data de agendamento configurada.',
          );
        }
        aplicacao.estado = EstadoAplicacaoEnum.AGENDADA;
        aplicacao.dataInicio = configGerais.dataAgendamento;
        aplicacao.dataFim = new Date(
          configGerais.dataAgendamento.getTime() + tempoMaximoMs,
        );
      } else {
        const now = new Date();
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
  async updateAplicacao(
    id: number,
    avaliacao: AvaliacaoModel,
    estado: EstadoAplicacaoEnum,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
        relations: [
          'avaliacao',
          'avaliacao.configuracaoAvaliacao',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        ],
      });

      const estadoAnterior = aplicacao.estado;
      const now = new Date();
      aplicacao.estado = estado;

      if (
        estado === EstadoAplicacaoEnum.PAUSADA &&
        estadoAnterior !== EstadoAplicacaoEnum.PAUSADA
      ) {
        aplicacao.pausedAt = now;
        console.log(
          `Repositório: Aplicação ${id} pausada em ${aplicacao.pausedAt.toISOString()}`,
        );
      } else if (
        estado === EstadoAplicacaoEnum.EM_ANDAMENTO &&
        estadoAnterior === EstadoAplicacaoEnum.PAUSADA
      ) {
        if (aplicacao.pausedAt) {
          const pauseDurationMs = now.getTime() - aplicacao.pausedAt.getTime();
          const newEndTime = new Date(
            aplicacao.dataFim.getTime() + pauseDurationMs,
          );
          console.log(
            `Repositório: Aplicação ${id} retomada. Pausa durou ${pauseDurationMs / 1000}s. Data Fim original: ${aplicacao.dataFim.toISOString()}, Nova Data Fim: ${newEndTime.toISOString()}`,
          );
          aplicacao.dataFim = newEndTime;
          aplicacao.pausedAt = null;
        } else {
          console.warn(
            `Repositório: Aplicação ${id} estava marcada como PAUSADA, mas não tinha pausedAt registrado. Retomando sem ajustar tempo.`,
          );
          aplicacao.pausedAt = null;
        }
      } else if (
        estado === EstadoAplicacaoEnum.AGENDADA &&
        estadoAnterior !== EstadoAplicacaoEnum.AGENDADA
      ) {
        const configGerais = await manager.findOne(ConfiguracoesGeraisModel, {
          where: {
            id: aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
              .id,
          },
        });
        if (!configGerais || !configGerais.dataAgendamento) {
          throw new BadRequestException(
            'Data de agendamento não configurada para avaliação agendada',
          );
        }
        const tempoMaximoMs = configGerais.tempoMaximo * 60 * 1000;
        aplicacao.dataInicio = configGerais.dataAgendamento;
        aplicacao.dataFim = new Date(
          configGerais.dataAgendamento.getTime() + tempoMaximoMs,
        );
        aplicacao.pausedAt = null;
        console.log(
          `Repositório: Aplicação ${id} agendada. Início: ${aplicacao.dataInicio.toISOString()}, Fim: ${aplicacao.dataFim.toISOString()}`,
        );
      }
      aplicacao.estado = estado;

      const updatedAplicacao = await manager.save(aplicacao);
      console.log(
        `Repositório: Aplicação ${id} salva com estado ${updatedAplicacao.estado}, dataFim ${updatedAplicacao.dataFim.toISOString()}, pausedAt ${String(updatedAplicacao.pausedAt)}`,
      );

      const estadosFinaisAplicacao: EstadoAplicacaoEnum[] = [
        EstadoAplicacaoEnum.FINALIZADA,
        EstadoAplicacaoEnum.CANCELADA,
        EstadoAplicacaoEnum.CONCLUIDA,
      ];
      const estadosAtivosSubmissao: EstadoSubmissaoEnum[] = [
        EstadoSubmissaoEnum.INICIADA,
        EstadoSubmissaoEnum.REABERTA,
        EstadoSubmissaoEnum.PAUSADA,
        EstadoSubmissaoEnum.CODIGO_CONFIRMADO,
      ];

      if (
        estadosFinaisAplicacao.includes(estado) &&
        !estadosFinaisAplicacao.includes(estadoAnterior)
      ) {
        console.log(
          `Repositório: Aplicação ${id} movida para estado final (${estado}). Atualizando submissões ativas para ENCERRADA.`,
        );
        const submissaoRepo = manager.getRepository(SubmissaoModel);
        const updateResult = await submissaoRepo.update(
          {
            aplicacao: { id: aplicacao.id },
            estado: In(estadosAtivosSubmissao),
          },
          {
            estado: EstadoSubmissaoEnum.ENCERRADA,
            finalizadoEm: now,
          },
        );
        console.log(
          `Repositório: ${updateResult.affected ?? 0} submissões atualizadas para ENCERRADA.`,
        );
      }
      return updatedAplicacao.id;
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
        'avaliacao.arquivos',
        'avaliacao.questoes',
        'avaliacao.questoes.questao',
        'avaliacao.arquivos.arquivo',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
      ],
    });
  }

  async deleteAplicacao(id: number, avaliador: AvaliadorModel): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      });

      if (!aplicacao) {
        throw new BadRequestException('Aplicação não encontrada');
      }

      await manager.delete(AplicacaoModel, { id });
    });
  }
}
