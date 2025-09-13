import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import {
  CreateAplicacaoController,
  FindAllAplicacoesController,
  FindAplicacaoByIdController,
  UpdateAplicacaoController,
  DeleteAplicacaoController,
} from './';

@Module({
  imports: [ServiceModule],
  controllers: [
    CreateAplicacaoController,
    FindAplicacaoByIdController,
    FindAllAplicacoesController,
    UpdateAplicacaoController,
    DeleteAplicacaoController,
  ],
})
export class BackofficeAplicacaoControllersModule {}
