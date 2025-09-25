import { Module } from '@nestjs/common';
import { BackofficeAvaliadorControllersModule } from './avaliador/backoffice-avaliador-controllers.module';
import { BackofficeQuestaoControllersModule } from './questao/backoffice-questao-controllers.module';
import { ItemSistemaArquivosControllersModule } from './item-sistema-arquivos/item-sistema-arquivos-controllers.module';
import { BancoDeConteudoControllersModule } from './banco-de-conteudo/banco-de-conteudo-controllers.module';
import { BackofficeArquivoControllersModule } from './arquivo/backoffice-arquivo-controllers.module';
import { BackofficeSubmissaoControllersModule } from './submissao/backoffice-submissao-controllers.module';
@Module({
  imports: [
    BackofficeAvaliadorControllersModule,
    BackofficeQuestaoControllersModule,
    ItemSistemaArquivosControllersModule,
    BancoDeConteudoControllersModule,
    BackofficeArquivoControllersModule,
    BackofficeSubmissaoControllersModule,
  ],
  exports: [
    BackofficeAvaliadorControllersModule,
    BackofficeQuestaoControllersModule,
    ItemSistemaArquivosControllersModule,
    BancoDeConteudoControllersModule,
    BackofficeArquivoControllersModule,
    BackofficeSubmissaoControllersModule,
  ],
})
export class BackofficeControllersModule {}
