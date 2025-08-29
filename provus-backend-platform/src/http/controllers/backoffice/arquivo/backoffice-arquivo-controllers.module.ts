import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { CreateArquivoController } from './create-arquivo/controller';
import { FindArquivoController } from './find-arquivo/controller';
import { UpdateArquivoController } from './update-arquivo/controller';
import { FindAllArquivosController } from './find-all-arquivos/controller';

@Module({
  imports: [ServiceModule],
  controllers: [
    CreateArquivoController,
    FindArquivoController,
    UpdateArquivoController,
    FindAllArquivosController,
  ],
})
export class BackofficeArquivoControllersModule {}
