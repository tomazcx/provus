import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ProvidersModule,
    DatabaseModule,
    TypeOrmModule.forFeature([
      AvaliadorModel,
      AvaliadorConfirmarEmailModel,
      AvaliadorRecuperarSenhaModel,
      ItemSistemaArquivosModel,
      BancoDeConteudoModel,
      QuestaoModel,
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
  ],
  exports: [
    AuthService,
    AvaliadorService,
    QuestaoService,
    ItemSistemaArquivosService,
    BancoDeConteudoService,
    ArquivoService,
    AvaliacaoService,
  ],
})
export class ServiceModule {}
