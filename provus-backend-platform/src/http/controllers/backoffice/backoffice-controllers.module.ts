import { Module } from '@nestjs/common';
import { BackofficeAvaliadorControllersModule } from './avaliador/backoffice-avaliador-controllers.module';

@Module({
  imports: [BackofficeAvaliadorControllersModule],
  exports: [BackofficeAvaliadorControllersModule],
})
export class BackofficeControllersModule {}
