import { Module } from '@nestjs/common';
import { AuthControllersModule } from './auth/auth-controllers.module';
import { BackofficeControllersModule } from './backoffice/backoffice-controllers.module';

@Module({
  imports: [AuthControllersModule, BackofficeControllersModule],
})
export class ControllersModule {}
