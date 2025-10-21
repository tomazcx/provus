import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { CreateSubmissaoController, FindSubmissaoByHashController } from './';

@Module({
  imports: [ServiceModule],
  controllers: [CreateSubmissaoController, FindSubmissaoByHashController],
})
export class BackofficeSubmissaoControllersModule {}
