import { Module } from '@nestjs/common';
import {
  AvaliadorRepository,
  AvaliadorRecuperarSenhaRepository,
  AvaliadorConfirmarEmailRepository,
} from 'src/data/protocols/database';
import {
  AvaliadorTypeORMRepository,
  AvaliadorRecuperarSenhaTypeORMRepository,
  AvaliadorConfirmarEmailTypeORMRepository,
} from './repositories';
import { AvaliadorModel } from './config/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliadorRecuperarSenhaModel } from './config/models/avaliador-recuperar-senha';
import { AvaliadorConfirmarEmailModel } from './config/models/avaliador-confirmar-email';
import { AlternativaModel } from './config/models';
import { AvaliacaoModel } from './config/models/avaliacao';
import { ConfiguracaoAvaliacaoModel } from './config/models/configuracao-avaliacao';
import { ConfiguracoesGeraisModel } from './config/models/configuracoes-gerais';
import { ConfiguracoesSegurancaModel } from './config/models/configuracoes-seguranca';
import { ConfiguracaoNotificacaoModel } from './config/models/configuracao-notificacao';
import { IpsPermitidosModel } from './config/models/ips-permitidos';
import { ItemSistemaArquivosModel } from './config/models/item-sistema-arquivos';
import { QuestaoModel } from './config/models/questao';
import { QuestoesAvaliacoesModel } from './config/models/questoes-avaliacoes';
import { PastaModel } from './config/models/pasta';
import { ConfiguracoesRandomizacaoModel } from './config/models/configuracoes-randomizacao';
import { SubmissaoModel } from './config/models/submissao';
import { SubmissaoRespostasModel } from './config/models/submissao-respostas';
import { AplicacaoModel } from './config/models/aplicacao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvaliadorModel,
      AvaliadorRecuperarSenhaModel,
      AvaliadorConfirmarEmailModel,
      AlternativaModel,
      AvaliacaoModel,
      ConfiguracaoAvaliacaoModel,
      ConfiguracoesGeraisModel,
      ConfiguracoesSegurancaModel,
      ConfiguracaoNotificacaoModel,
      IpsPermitidosModel,
      ItemSistemaArquivosModel,
      QuestaoModel,
      QuestoesAvaliacoesModel,
      PastaModel,
      ConfiguracoesRandomizacaoModel,
      SubmissaoModel,
      SubmissaoRespostasModel,
      AplicacaoModel,
    ]),
  ],
  providers: [
    {
      provide: AvaliadorRepository,
      useClass: AvaliadorTypeORMRepository,
    },
    {
      provide: AvaliadorRecuperarSenhaRepository,
      useClass: AvaliadorRecuperarSenhaTypeORMRepository,
    },
    {
      provide: AvaliadorConfirmarEmailRepository,
      useClass: AvaliadorConfirmarEmailTypeORMRepository,
    },
  ],
  exports: [
    AvaliadorRepository,
    AvaliadorRecuperarSenhaRepository,
    AvaliadorConfirmarEmailRepository,
  ],
})
export class DatabaseModule {}
