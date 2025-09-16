import { Module } from '@nestjs/common';
import { AuthControllersModule } from './auth/auth-controllers.module';
import { BackofficeControllersModule } from './backoffice/backoffice-controllers.module';
import { ItemSistemaArquivosControllersModule } from './backoffice/item-sistema-arquivos/item-sistema-arquivos-controllers.module';
import { BancoDeConteudoControllersModule } from './backoffice/banco-de-conteudo/banco-de-conteudo-controllers.module';
import { BackofficeAvaliacaoControllersModule } from './backoffice/avaliacao/backoffice-avaliacao-controllers.module';
import { BackofficeAplicacaoControllersModule } from './backoffice/aplicacao/backoffice-aplicacao-controllers.module';

@Module({
  imports: [
    AuthControllersModule,
    BackofficeControllersModule,
    ItemSistemaArquivosControllersModule,
    BancoDeConteudoControllersModule,
    BackofficeAvaliacaoControllersModule,
    BackofficeAplicacaoControllersModule,
  ],
})
export class ControllersModule {}
