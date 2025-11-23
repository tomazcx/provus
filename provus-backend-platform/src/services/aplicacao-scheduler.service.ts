import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource, LessThanOrEqual } from 'typeorm';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import { NotificationProvider } from 'src/providers/notification.provider';

@Injectable()
export class AplicacaoSchedulerService {
  private readonly logger = new Logger(AplicacaoSchedulerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  @Cron('*/5 * * * * *')
  async checkScheduledApplications(): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const now = new Date();
        const agendedApplications = await manager.find(AplicacaoModel, {
          where: {
            estado: EstadoAplicacaoEnum.AGENDADA,
            dataInicio: LessThanOrEqual(now),
          },
          relations: [
            'avaliacao',
            'avaliacao.item',
            'avaliacao.item.avaliador',
            'avaliacao.configuracaoAvaliacao',
            'avaliacao.configuracaoAvaliacao.configuracoesGerais',
          ],
        });

        for (const aplicacao of agendedApplications) {
          const configGerais =
            aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais;

          const tempoMaximo = configGerais?.tempoMaximo || 120;
          const tempoMaximoMs = tempoMaximo * 60 * 1000;

          aplicacao.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
          aplicacao.dataInicio = now;
          aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);

          await manager.save(aplicacao);

          this.logger.log(
            `Scheduler: Aplicação ${aplicacao.id} iniciada automaticamente.`,
          );

          if (aplicacao.avaliacao?.item?.avaliador?.id) {
            this.notificationProvider.sendNotificationViaSocket(
              aplicacao.avaliacao.item.avaliador.id,
              'estado-aplicacao-atualizado',
              {
                aplicacaoId: aplicacao.id,
                novoEstado: EstadoAplicacaoEnum.EM_ANDAMENTO,
                novaDataFimISO: aplicacao.dataFim.toISOString(),
              },
            );
          }
        }
      });
    } catch (error) {
      this.logger.error('Erro tentando iniciar aplicacao com o @Cron', error);
    }
  }

  @Cron('*/5 * * * * *')
  async checkFinishingApplications(): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const now = new Date();
        const finishingApplications = await manager.find(AplicacaoModel, {
          where: {
            estado: EstadoAplicacaoEnum.EM_ANDAMENTO,
            dataFim: LessThanOrEqual(now),
          },
          relations: [
            'avaliacao',
            'avaliacao.item',
            'avaliacao.item.avaliador',
          ],
        });

        for (const aplicacao of finishingApplications) {
          aplicacao.estado = EstadoAplicacaoEnum.FINALIZADA;
          await manager.save(aplicacao);

          this.logger.log(
            `Scheduler: Aplicação ${aplicacao.id} finalizada automaticamente por tempo esgotado.`,
          );

          if (aplicacao.avaliacao?.item?.avaliador?.id) {
            this.notificationProvider.sendNotificationViaSocket(
              aplicacao.avaliacao.item.avaliador.id,
              'estado-aplicacao-atualizado',
              {
                aplicacaoId: aplicacao.id,
                novoEstado: EstadoAplicacaoEnum.FINALIZADA,
                novaDataFimISO: aplicacao.dataFim.toISOString(),
              },
            );
          }
        }
      });
    } catch (error) {
      this.logger.error('Erro tentando finalizar aplicacao com o @Cron', error);
    }
  }
}
