import { Module } from '@nestjs/common';
import { BackofficeAvaliadorControllersModule } from './avaliador/backoffice-avaliador-controllers.module';
import { BackofficeQuestaoControllersModule } from './questao/backoffice-questao-controllers.module';
@Module({
  imports: [
    BackofficeAvaliadorControllersModule,
    BackofficeQuestaoControllersModule,
  ],
  exports: [
    BackofficeAvaliadorControllersModule,
    BackofficeQuestaoControllersModule,
  ],
})
export class BackofficeControllersModule {}
