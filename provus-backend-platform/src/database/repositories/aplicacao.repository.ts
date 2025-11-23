import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AplicacaoModel } from '../config/models/aplicacao.model';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import { AvaliacaoModel } from '../config/models/avaliacao.model';
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
      const now = new Date();

      if (dto.dataInicio && dto.estado === EstadoAplicacaoEnum.AGENDADA) {
        const dataInicio = new Date(dto.dataInicio);
        if (isNaN(dataInicio.getTime())) {
          throw new BadRequestException('Data de início inválida.');
        }

        aplicacao.estado = EstadoAplicacaoEnum.AGENDADA;
        aplicacao.dataInicio = dataInicio;
        aplicacao.dataFim = new Date(dataInicio.getTime() + tempoMaximoMs);
      } else if (configGerais.tipoAplicacao === TipoAplicacaoEnum.AGENDADA) {
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
        where: {
          id,
          avaliacao: { item: { avaliador: { id: avaliador.id } } },
        },
        relations: [
          'avaliacao',
          'avaliacao.configuracaoAvaliacao',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        ],
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
          console.log(
            `Repositório: Aplicação ${id} pausada em ${aplicacao.pausedAt.toISOString()}`,
          );
        }
      } else {
        aplicacao.pausedAt = null;

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
            estadoAnterior === EstadoAplicacaoEnum.AGENDADA ||
            estadoAnterior === EstadoAplicacaoEnum.FINALIZADA ||
            estadoAnterior === EstadoAplicacaoEnum.CONCLUIDA ||
            estadoAnterior === EstadoAplicacaoEnum.CANCELADA)
        ) {
          const configGerais =
            aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais;
          const tempoMaximoMs = configGerais.tempoMaximo * 60 * 1000;
          aplicacao.dataInicio = now;
          aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);
        } else if (
          estado === EstadoAplicacaoEnum.AGENDADA &&
          estadoAnterior !== EstadoAplicacaoEnum.AGENDADA
        ) {
          const configGerais =
            aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais;
          if (!aplicacao.dataInicio && configGerais.dataAgendamento) {
            aplicacao.dataInicio = configGerais.dataAgendamento;
          }
        }
      }

      const updatedAplicacao = await manager.save(aplicacao);

      const estadosFinaisAplicacao: EstadoAplicacaoEnum[] = [
        EstadoAplicacaoEnum.FINALIZADA,
        EstadoAplicacaoEnum.CANCELADA,
        EstadoAplicacaoEnum.CONCLUIDA,
      ];

      const estadosAtivosSubmissao: EstadoSubmissaoEnum[] = [
        EstadoSubmissaoEnum.INICIADA,
        EstadoSubmissaoEnum.REABERTA,
        EstadoSubmissaoEnum.PAUSADA,
      ];

      if (
        estadosFinaisAplicacao.includes(estado) &&
        !estadosFinaisAplicacao.includes(estadoAnterior)
      ) {
        const submissaoRepo = manager.getRepository(SubmissaoModel);
        await submissaoRepo.update(
          {
            aplicacao: { id: aplicacao.id },
            estado: In(estadosAtivosSubmissao),
          },
          {
            estado: EstadoSubmissaoEnum.ENCERRADA,
            finalizadoEm: now,
          },
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
        where: {
          id,
          avaliacao: { item: { avaliador: { id: avaliador.id } } },
        },
      });

      if (!aplicacao) {
        throw new BadRequestException('Aplicação não encontrada');
      }

      await manager.delete(AplicacaoModel, { id });
    });
  }
}
