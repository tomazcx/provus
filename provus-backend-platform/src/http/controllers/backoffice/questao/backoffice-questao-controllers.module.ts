import { Module } from '@nestjs/common';
import { FindQuestaoController } from './index';
import { ServiceModule } from 'src/services/services.module';
import { QuestaoRepository } from 'src/database/repositories/questao.repository';
import { QuestaoService } from 'src/services/questao.service';

@Module({
  providers: [QuestaoService, QuestaoRepository],
  imports: [ServiceModule],
  controllers: [FindQuestaoController],
})
export class BackofficeQuestaoControllersModule {}
