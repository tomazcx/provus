import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import {
  CreateAvaliacaoController,
  FindAllAvaliacoesController,
  FindAvaliacaoByIdController,
  UpdateAvaliacaoController,
} from './';

@Module({
  imports: [ServiceModule],
  controllers: [
    CreateAvaliacaoController,
    FindAvaliacaoByIdController,
    FindAllAvaliacoesController,
    UpdateAvaliacaoController,
  ],
})
export class BackofficeAvaliacaoControllersModule {}
