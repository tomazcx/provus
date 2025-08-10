import { Module } from '@nestjs/common';
import {
  ResetPasswordController,
  SignInController,
  SignUpController,
  RecoverPasswordController,
  ConfirmEmailController,
} from './';
import { ServiceModule } from 'src/data/services-implementation/services.module';

@Module({
  imports: [ServiceModule],
  controllers: [
    SignUpController,
    SignInController,
    ResetPasswordController,
    RecoverPasswordController,
    ConfirmEmailController,
  ],
})
export class AuthControllersModule {}
