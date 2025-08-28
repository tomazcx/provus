import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { DeleteItemController } from './delete/controller';
import { FindConteudoPastaController } from './find-conteudo-pasta/controller';
import { ExpandirQuestoesController } from './expandir-questoes/controller';
import { FindQuestoesByIdsController } from './find-questoes-by-ids/controller';

@Module({
  imports: [ServiceModule],
  controllers: [
    DeleteItemController,
    FindConteudoPastaController,
    ExpandirQuestoesController,
    FindQuestoesByIdsController,
  ],
})
export class ItemSistemaArquivosControllersModule {}
