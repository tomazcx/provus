import { Module } from '@nestjs/common';
import { FindQuestaoController } from './index';
import { ServiceModule } from 'src/services/services.module';
import { QuestaoService } from 'src/services/questao.service';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [QuestaoService, ItemSistemaArquivosRepository],
  imports: [ServiceModule, TypeOrmModule.forFeature([QuestaoModel])],
  controllers: [FindQuestaoController],
})
export class BackofficeQuestaoControllersModule {}
