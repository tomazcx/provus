import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';

@Injectable()
export class AplicacaoSchedulerService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly dataSource: DataSource,
  ) {}

  scheduleApplicationStart(aplicacaoId: number, startDate: Date): void {
    const jobName = `start-aplicacao-${aplicacaoId}`;

    const timeout = setTimeout(() => {
      this.startScheduledApplication(aplicacaoId).catch(() => {
        Logger.log('Erro tentando criar scheduler');
      });
      this.schedulerRegistry.deleteTimeout(jobName);
    }, startDate.getTime() - Date.now());

    this.schedulerRegistry.addTimeout(jobName, timeout);
  }

  cancelScheduledStart(aplicacaoId: number): void {
    try {
      this.schedulerRegistry.deleteTimeout(`start-aplicacao-${aplicacaoId}`);
    } catch {
      Logger.log('Erro tentando criar scheduler');
    }
    try {
      this.schedulerRegistry.deleteTimeout(`finish-aplicacao-${aplicacaoId}`);
    } catch {
      Logger.log('Erro tentando criar scheduler');
    }
  }

  private async startScheduledApplication(aplicacaoId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: { id: aplicacaoId, estado: EstadoAplicacaoEnum.AGENDADA },
        relations: [
          'avaliacao',
          'avaliacao.configuracaoAvaliacao',
          'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        ],
      });

      if (!aplicacao) {
        return;
      }

      const now = new Date();
      const tempoMaximoMs =
        aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
          .tempoMaximo *
        60 *
        1000;

      aplicacao.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
      aplicacao.dataInicio = now;
      aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);

      await manager.save(aplicacao);

      this.scheduleFinish(aplicacaoId, aplicacao.dataFim);
    });
  }

  scheduleFinish(aplicacaoId: number, finishDate: Date): void {
    const finishJobName = `finish-aplicacao-${aplicacaoId}`;

    const finishTimeout = setTimeout(() => {
      this.finishApplication(aplicacaoId).catch(() => {});
      this.schedulerRegistry.deleteTimeout(finishJobName);
    }, finishDate.getTime() - Date.now());

    this.schedulerRegistry.addTimeout(finishJobName, finishTimeout);
  }

  private async finishApplication(aplicacaoId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: { id: aplicacaoId, estado: EstadoAplicacaoEnum.EM_ANDAMENTO },
      });

      if (!aplicacao) {
        return;
      }

      aplicacao.estado = EstadoAplicacaoEnum.FINALIZADA;
      await manager.save(aplicacao);
    });
  }
}
