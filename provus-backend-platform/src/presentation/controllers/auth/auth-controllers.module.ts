import { Module } from '@nestjs/common';
import {
  ResetPasswordController,
  SignInController,
  SignUpController,
  RecoverPasswordController,
} from './';
import { ServiceModule } from 'src/data/services-implementation/services.module';

@Module({
  imports: [ServiceModule],
  controllers: [
    SignUpController,
    SignInController,
    ResetPasswordController,
    RecoverPasswordController,
  ],
})
export class AuthControllersModule {}
