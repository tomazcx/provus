import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { DeleteItemController } from './delete/controller';

@Module({
  imports: [ServiceModule],
  controllers: [DeleteItemController],
})
export class ItemSistemaArquivosControllersModule {}
