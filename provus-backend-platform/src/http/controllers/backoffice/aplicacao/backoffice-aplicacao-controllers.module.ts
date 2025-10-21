import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import {
  CreateAplicacaoController,
  FindAllAplicacoesController,
  FindAplicacaoByIdController,
  UpdateAplicacaoController,
  DeleteAplicacaoController,
} from './';
import { GetMonitoramentoInicialController } from './get-monitoramento-inicial/controller';

@Module({
  imports: [ServiceModule],
  controllers: [
    CreateAplicacaoController,
    FindAplicacaoByIdController,
    FindAllAplicacoesController,
    UpdateAplicacaoController,
    DeleteAplicacaoController,
    GetMonitoramentoInicialController,
  ],
})
export class BackofficeAplicacaoControllersModule {}
