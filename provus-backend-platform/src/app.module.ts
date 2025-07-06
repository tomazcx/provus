import { Module } from '@nestjs/common';
import { ControllersModule } from './presentation/controllers/controllers.module';

@Module({
  imports: [ControllersModule],
})
export class AppModule {}
