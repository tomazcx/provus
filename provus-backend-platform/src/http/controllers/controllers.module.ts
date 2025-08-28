import { Module } from '@nestjs/common';
import { AuthControllersModule } from './auth/auth-controllers.module';
import { BackofficeControllersModule } from './backoffice/backoffice-controllers.module';
import { ItemSistemaArquivosControllersModule } from './backoffice/item-sistema-arquivos/item-sistema-arquivos-controllers.module';
import { BancoDeConteudoControllersModule } from './backoffice/banco-de-conteudo/banco-de-conteudo-controllers.module';

@Module({
  imports: [
    AuthControllersModule,
    BackofficeControllersModule,
    ItemSistemaArquivosControllersModule,
    BancoDeConteudoControllersModule,
  ],
})
export class ControllersModule {}
