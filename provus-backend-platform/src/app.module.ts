import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ControllersModule } from './presentation/controllers/controllers.module';

@Module({
  imports: [SharedModule, ControllersModule],
})
export class AppModule {}
