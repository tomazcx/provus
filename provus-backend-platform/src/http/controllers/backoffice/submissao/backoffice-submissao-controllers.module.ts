import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { CreateSubmissaoController } from './';

@Module({
  imports: [ServiceModule],
  controllers: [CreateSubmissaoController],
})
export class BackofficeSubmissaoControllersModule {}
