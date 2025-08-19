import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.module';
import { AvaliadorService } from './avaliador.service';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ProvidersModule, DatabaseModule],
  providers: [AuthService, AvaliadorService],
  exports: [AuthService, AvaliadorService],
})
export class ServiceModule {}
