import { Module } from '@nestjs/common';
import {
  FindLoggedAvaliadorController,
  UpdateLoggedAvaliadorController,
} from './';
import { ServiceModule } from 'src/services/services.module';

@Module({
  imports: [ServiceModule],
  controllers: [FindLoggedAvaliadorController, UpdateLoggedAvaliadorController],
})
export class BackofficeAvaliadorControllersModule {}
