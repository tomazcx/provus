import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ProvidersModule } from 'src/providers/providers.module';
import { DatabaseModule } from 'src/database/database.module';

import { AvaliadorService } from './avaliador.service';
import { AuthService } from './auth.service';
import { ItemSistemaArquivosService } from './item-sistema-arquivos.service';
import { QuestaoService } from './questao.service';
import { BancoDeConteudoService } from './banco-de-conteudo.service';

import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AvaliadorConfirmarEmailModel } from 'src/database/config/models/avaliador-confirmar-email.model';
import { AvaliadorRecuperarSenhaModel } from 'src/database/config/models/avaliador-recuperar-senha.model';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { BancoDeConteudoModel } from 'src/database/config/models/banco-de-conteudo.model';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { ArquivoService } from './arquivo.service';
import { AvaliacaoService } from './avaliacao.service';
import { TextExtractorService } from 'src/providers/text-extractor.provider';
import { AplicacaoService } from './aplicacao.service';
import { AplicacaoSchedulerService } from './aplicacao-scheduler.service';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { EstudanteModel } from 'src/database/config/models/estudante.model';
import { SubmissaoService } from './submissao.service';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import { RegistroPunicaoPorOcorrenciaModel } from 'src/database/config/models/registro-punicao-por-ocorrencia.model';
import { SubmissaoRespostasModel } from 'src/database/config/models/submissao-respostas.model';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [
    forwardRef(() => GatewayModule),
    forwardRef(() => ProvidersModule),
    DatabaseModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      AvaliadorModel,
      AvaliadorConfirmarEmailModel,
      AvaliadorRecuperarSenhaModel,
      ItemSistemaArquivosModel,
      BancoDeConteudoModel,
      QuestaoModel,
      SubmissaoModel,
      EstudanteModel,
      AplicacaoModel,
      RegistroPunicaoPorOcorrenciaModel,
      SubmissaoRespostasModel,
    ]),
  ],
  providers: [
    AuthService,
    AvaliadorService,
    QuestaoService,
    ItemSistemaArquivosService,
    BancoDeConteudoService,
    ArquivoService,
    AvaliacaoService,
    TextExtractorService,
    AplicacaoService,
    AplicacaoSchedulerService,
    SubmissaoService,
  ],
  exports: [
    AuthService,
    AvaliadorService,
    QuestaoService,
    ItemSistemaArquivosService,
    BancoDeConteudoService,
    ArquivoService,
    AvaliacaoService,
    AplicacaoService,
    AplicacaoSchedulerService,
    SubmissaoService,
  ],
})
export class ServiceModule {}
