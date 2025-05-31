import { Module } from '@nestjs/common';
import { AuthControllersModule } from './auth/auth-controllers.module';

@Module({
  imports: [AuthControllersModule],
})
export class ControllersModule {}
