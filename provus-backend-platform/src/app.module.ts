import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ControllersModule } from './http/controllers/controllers.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [SharedModule, ControllersModule, GatewayModule],
})
export class AppModule {}
