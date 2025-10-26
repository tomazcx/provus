import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { CreateSubmissaoController, FindSubmissaoByHashController } from './';
import { SubmitAvaliacaoController } from './submit-avaliacao/controller';
import { FindSubmissaoRevisaoController } from './find-submissao-revisao/controller';

@Module({
  imports: [ServiceModule],
  controllers: [
    CreateSubmissaoController,
    FindSubmissaoByHashController,
    SubmitAvaliacaoController,
    FindSubmissaoRevisaoController,
  ],
})
export class BackofficeSubmissaoControllersModule {}
