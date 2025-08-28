import { Module } from '@nestjs/common';
import { CreateQuestaoController, FindQuestaoController } from './index';
import { ServiceModule } from 'src/services/services.module';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateQuestaoController } from './update-questao/controller';
import { DatabaseModule } from 'src/database/database.module';
import { FindAllQuestaoController } from './find-all-questao/controller';

@Module({
  imports: [
    ServiceModule,
    TypeOrmModule.forFeature([QuestaoModel]),
    DatabaseModule,
  ],
  controllers: [
    FindQuestaoController,
    CreateQuestaoController,
    UpdateQuestaoController,
    FindAllQuestaoController,
  ],
})
export class BackofficeQuestaoControllersModule {}
