import { Module, forwardRef } from '@nestjs/common';
import { SubmissaoGateway } from './gateways/submissao.gateway';
import { AvaliadorGateway } from './gateways/avaliador.gateway';
import { ServiceModule } from 'src/services/services.module';
import { DatabaseModule } from 'src/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { ProvidersModule } from 'src/providers/providers.module';

@Module({
  imports: [
    forwardRef(() => ProvidersModule),
    forwardRef(() => ServiceModule),
    DatabaseModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([SubmissaoModel]),
  ],
  providers: [SubmissaoGateway, AvaliadorGateway],
  exports: [SubmissaoGateway, AvaliadorGateway],
})
export class GatewayModule {}
