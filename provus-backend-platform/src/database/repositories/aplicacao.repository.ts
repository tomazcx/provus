import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AplicacaoModel } from '../config/models/aplicacao.model';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import { AvaliacaoModel } from '../config/models/avaliacao.model';

@Injectable()
export class AplicacaoRepository extends Repository<AplicacaoModel> {
  constructor(private dataSource: DataSource) {
    super(AplicacaoModel, dataSource.createEntityManager());
  }

  async createAplicacao(dto: CreateAplicacaoDto): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = new AplicacaoModel();
      aplicacao.codigoAcesso = await this.generateUniqueAccessCode(manager);
      aplicacao.estado = dto.estado;

      const avaliacaoEntity = await manager.findOne(AvaliacaoModel, {
        where: { id: dto.avaliacaoId },
        relations: [
          'configuracaoAvaliacao',
          'configuracaoAvaliacao.configuracoesGerais',
        ],
      });

      if (!avaliacaoEntity) {
        throw new BadRequestException(
          `Avaliação com ID ${dto.avaliacaoId} não encontrada`,
        );
      }

      aplicacao.avaliacao = avaliacaoEntity;

      const tipoAplicacao =
        avaliacaoEntity.configuracaoAvaliacao.configuracoesGerais.tipoAplicacao;
      const tempoMaximoMs =
        avaliacaoEntity.configuracaoAvaliacao.configuracoesGerais.tempoMaximo *
        60 *
        1000;

      if (
        dto.estado === EstadoAplicacaoEnum.AGENDADA &&
        tipoAplicacao !== TipoAplicacaoEnum.AGENDADA
      ) {
        throw new BadRequestException(
          'Estado AGENDADA só é permitido para avaliações do tipo AGENDADA',
        );
      }

      if (dto.estado === EstadoAplicacaoEnum.AGENDADA) {
        const dataAgendamento =
          avaliacaoEntity.configuracaoAvaliacao.configuracoesGerais
            .dataAgendamento;
        if (!dataAgendamento) {
          throw new BadRequestException(
            'Data de agendamento não configurada para avaliação agendada',
          );
        }
        aplicacao.dataInicio = dataAgendamento;
        aplicacao.dataFim = new Date(dataAgendamento.getTime() + tempoMaximoMs);
      } else if (dto.estado === EstadoAplicacaoEnum.EM_ANDAMENTO) {
        const now = new Date();
        aplicacao.dataInicio = now;
        aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);
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
      aplicacao.estado = estado;

      if (
        estado === EstadoAplicacaoEnum.EM_ANDAMENTO &&
        estadoAnterior !== EstadoAplicacaoEnum.EM_ANDAMENTO
      ) {
        const now = new Date();
        const tempoMaximoMs =
          aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
            .tempoMaximo *
          60 *
          1000;

        aplicacao.dataInicio = now;
        aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);
      }

      if (
        estado === EstadoAplicacaoEnum.AGENDADA &&
        estadoAnterior !== EstadoAplicacaoEnum.AGENDADA
      ) {
        const tempoMaximoMs =
          aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
            .tempoMaximo *
          60 *
          1000;
        const dataAgendamento =
          aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
            .dataAgendamento;
        if (!dataAgendamento) {
          throw new BadRequestException(
            'Data de agendamento não configurada para avaliação agendada',
          );
        }
        aplicacao.dataInicio = dataAgendamento;
        aplicacao.dataFim = new Date(dataAgendamento.getTime() + tempoMaximoMs);
      }
      const updatedAplicacao = await manager.save(aplicacao);

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

  private async generateUniqueAccessCode(
    manager: EntityManager,
  ): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const existingAplicacao = await manager.findOne(AplicacaoModel, {
        where: { codigoAcesso: code },
      });

      if (!existingAplicacao) {
        return code;
      }

      attempts++;
    }

    throw new BadRequestException(
      'Não foi possível gerar um código de acesso único após várias tentativas',
    );
  }
}
