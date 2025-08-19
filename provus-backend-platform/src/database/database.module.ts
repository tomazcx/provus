import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliadorRecuperarSenhaModel } from './config/models/avaliador-recuperar-senha.model';
import { AvaliadorConfirmarEmailModel } from './config/models/avaliador-confirmar-email.model';
import { AvaliadorModel } from './config/models/avaliador.model';
import { AvaliacaoModel } from './config/models/avaliacao.model';
import { ConfiguracaoAvaliacaoModel } from './config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from './config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from './config/models/configuracoes-seguranca.model';
import { ConfiguracaoNotificacaoModel } from './config/models/configuracao-notificacao.model';
import { IpsPermitidosModel } from './config/models/ips-permitidos.model';
import { ItemSistemaArquivosModel } from './config/models/item-sistema-arquivos.model';
import { QuestaoModel } from './config/models/questao.model';
import { QuestoesAvaliacoesModel } from './config/models/questoes-avaliacoes.model';
import { ConfiguracoesRandomizacaoModel } from './config/models/configuracoes-randomizacao.model';
import { SubmissaoModel } from './config/models/submissao.model';
import { SubmissaoRespostasModel } from './config/models/submissao-respostas.model';
import { AplicacaoModel } from './config/models/aplicacao.model';
import { AlternativaModel } from './config/models/alternativa.model';
import { DatabaseConfigModule } from './config/database-config.module';

@Module({
  imports: [
    DatabaseConfigModule,
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
      ConfiguracoesRandomizacaoModel,
      SubmissaoModel,
      SubmissaoRespostasModel,
      AplicacaoModel,
    ]),
  ],
  exports: [TypeOrmModule, DatabaseConfigModule],
})
export class DatabaseModule {}
