import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/services.module';
import { FindConteudoBancoController } from './find-conteudo-banco/controller';
import { FindAllBancosController } from './find-all-bancos/controllers';

@Module({
  imports: [ServiceModule],
  controllers: [FindConteudoBancoController, FindAllBancosController],
})
export class BancoDeConteudoControllersModule {}
