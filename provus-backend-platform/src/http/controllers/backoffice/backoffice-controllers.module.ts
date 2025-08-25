import { Module } from '@nestjs/common';
import { BackofficeAvaliadorControllersModule } from './avaliador/backoffice-avaliador-controllers.module';
import { BackofficeQuestaoControllersModule } from './questao/backoffice-questao-controllers.module';
import { ItemSistemaArquivosControllersModule } from './item-sistema-arquivos/item-sistema-arquivos-controllers.module';
@Module({
  imports: [
    BackofficeAvaliadorControllersModule,
    BackofficeQuestaoControllersModule,
    ItemSistemaArquivosControllersModule,
  ],
  exports: [
    BackofficeAvaliadorControllersModule,
    BackofficeQuestaoControllersModule,
    ItemSistemaArquivosControllersModule,
  ],
})
export class BackofficeControllersModule {}
