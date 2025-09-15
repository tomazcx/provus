import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource, LessThanOrEqual } from 'typeorm';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';

@Injectable()
export class AplicacaoSchedulerService {
  private readonly logger = new Logger(AplicacaoSchedulerService.name);

  constructor(private readonly dataSource: DataSource) {}

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
            'avaliacao.configuracaoAvaliacao',
            'avaliacao.configuracaoAvaliacao.configuracoesGerais',
          ],
        });

        for (const aplicacao of agendedApplications) {
          const tempoMaximoMs =
            aplicacao.avaliacao.configuracaoAvaliacao.configuracoesGerais
              .tempoMaximo *
            60 *
            1000;

          aplicacao.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
          aplicacao.dataInicio = now;
          aplicacao.dataFim = new Date(now.getTime() + tempoMaximoMs);

          await manager.save(aplicacao);
          this.logger.log(`Application ${aplicacao.id} started automatically`);
        }
      });
    } catch (error) {
      this.logger.error('Erro tentando agendar aplicacao com o @Cron', error);
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
        });

        for (const aplicacao of finishingApplications) {
          aplicacao.estado = EstadoAplicacaoEnum.FINALIZADA;
          await manager.save(aplicacao);
          this.logger.log(`Application ${aplicacao.id} finished automatically`);
        }
      });
    } catch (error) {
      this.logger.error('Erro tentando agendar aplicacao com o @Cron', error);
    }
  }
}
