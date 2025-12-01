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
import { UpdateAplicacaoSubmissaoEstadoController } from './update-aplicacao-submissao-estado/controller';
import { EvaluateSubmissaoRespostaDiscursivaController } from './evaluate-submissao-resposta-discursiva/controller';
import { UpdateReleaseConfigController } from './update-release-config/controller';

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
    EvaluateSubmissaoRespostaDiscursivaController,
    UpdateAplicacaoSubmissaoEstadoController,
    UpdateReleaseConfigController,
  ],
})
export class BackofficeAplicacaoControllersModule {}
