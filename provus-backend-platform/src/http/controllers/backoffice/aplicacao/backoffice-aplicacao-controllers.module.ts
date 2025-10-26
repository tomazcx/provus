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
import { FindSubmissoesByAplicacaoController } from './find-submissoes-by-aplicacao/controller';
import { FindSubmissionDetailsForEvaluatorController } from './find-submissao-detalhe-avaliador/controller';

@Module({
  imports: [ServiceModule],
  controllers: [
    CreateAplicacaoController,
    FindAplicacaoByIdController,
    FindAllAplicacoesController,
    UpdateAplicacaoController,
    DeleteAplicacaoController,
    GetMonitoramentoInicialController,
    FindSubmissoesByAplicacaoController,
    FindSubmissionDetailsForEvaluatorController,
  ],
})
export class BackofficeAplicacaoControllersModule {}
