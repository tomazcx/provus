import { Injectable, NotFoundException } from '@nestjs/common';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AplicacaoSchedulerService } from './aplicacao-scheduler.service';
import { AplicacaoRepository } from 'src/database/repositories/aplicacao.repository';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import { AplicacaoDto } from 'src/dto/result/aplicacao/aplicacao.dto';
import { FindAllAplicacaoDto } from 'src/dto/result/aplicacao/find-all-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';

@Injectable()
export class AplicacaoService {
  constructor(
    private readonly aplicacaoRepository: AplicacaoRepository,
    private readonly aplicacaoSchedulerService: AplicacaoSchedulerService,
  ) {}

  async findById(id: number, avaliador: AvaliadorModel): Promise<AplicacaoDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
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

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    return new AplicacaoDto(aplicacao);
  }

  async findAll(avaliadorId: number): Promise<FindAllAplicacaoDto[]> {
    const aplicacoes = await this.aplicacaoRepository.findAll(avaliadorId);

    return aplicacoes.map((aplicacao) => new FindAllAplicacaoDto(aplicacao));
  }

  async createAplicacao(
    dto: CreateAplicacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoDto> {
    const aplicacaoId = await this.aplicacaoRepository.createAplicacao(dto);

    if (dto.estado === EstadoAplicacaoEnum.AGENDADA) {
      const aplicacao = await this.aplicacaoRepository.findOne({
        where: { id: aplicacaoId },
        relations: [
          'avaliacao',
          'avaliacao.configuracaoAvaliacao',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        ],
      });

      if (
        aplicacao?.avaliacao.configuracaoAvaliacao.configuracoesGerais
          .dataAgendamento
      ) {
        this.aplicacaoSchedulerService.scheduleApplicationStart(
          aplicacaoId,
          aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
            .dataAgendamento,
        );
      }
    }

    return this.findById(aplicacaoId, avaliador);
  }

  async update(
    id: number,
    estado: EstadoAplicacaoEnum,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      relations: [
        'avaliacao',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    const estadoAnterior = aplicacao.estado;

    const aplicacaoId = await this.aplicacaoRepository.updateAplicacao(
      id,
      aplicacao.avaliacao,
      estado,
      avaliador,
    );

    if (
      estado === EstadoAplicacaoEnum.AGENDADA &&
      estadoAnterior !== EstadoAplicacaoEnum.AGENDADA
    ) {
      const dataAgendamento =
        aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
          .dataAgendamento;
      if (dataAgendamento) {
        this.aplicacaoSchedulerService.scheduleApplicationStart(
          id,
          dataAgendamento,
        );
      }
    } else if (
      estadoAnterior === EstadoAplicacaoEnum.AGENDADA &&
      estado !== EstadoAplicacaoEnum.AGENDADA
    ) {
      this.aplicacaoSchedulerService.cancelScheduledStart(id);
    }

    return this.findById(aplicacaoId, avaliador);
  }

  async delete(id: number, avaliador: AvaliadorModel): Promise<void> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
    });

    if (aplicacao?.estado === EstadoAplicacaoEnum.AGENDADA) {
      this.aplicacaoSchedulerService.cancelScheduledStart(id);
    }

    await this.aplicacaoRepository.deleteAplicacao(id, avaliador);
  }
}
