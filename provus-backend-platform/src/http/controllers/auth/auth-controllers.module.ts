import { Module } from '@nestjs/common';
import {
  ResetPasswordController,
  SignInController,
  SignUpController,
  RecoverPasswordController,
  ConfirmEmailController,
} from './';
import { ServiceModule } from 'src/services/services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliadorConfirmarEmailModel } from 'src/database/config/models/avaliador-confirmar-email.model';
import { AvaliadorRecuperarSenhaModel } from 'src/database/config/models/avaliador-recuperar-senha.model';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { BancoDeConteudoModel } from 'src/database/config/models/banco-de-conteudo.model';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';

@Module({
  imports: [
    ServiceModule,
    TypeOrmModule.forFeature([
      AvaliadorModel,
      AvaliadorConfirmarEmailModel,
      AvaliadorRecuperarSenhaModel,
      BancoDeConteudoModel,
      ItemSistemaArquivosModel,
    ]),
  ],
  controllers: [
    SignUpController,
    SignInController,
    ResetPasswordController,
    RecoverPasswordController,
    ConfirmEmailController,
  ],
})
export class AuthControllersModule {}
