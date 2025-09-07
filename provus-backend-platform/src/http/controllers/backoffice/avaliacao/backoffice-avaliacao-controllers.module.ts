import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { CreateAvaliacaoController, FindAvaliacaoByIdController } from './';

@Module({
  imports: [ServiceModule],
  controllers: [CreateAvaliacaoController, FindAvaliacaoByIdController],
})
export class BackofficeAvaliacaoControllersModule {}
