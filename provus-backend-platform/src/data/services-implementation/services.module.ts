import { Module } from '@nestjs/common';
import { AuthServiceImpl } from './auth';
import { AuthService } from 'src/domain/services';
import { InfraModule } from 'src/infra/infra.module';
import { AvaliadorService } from 'src/domain/services';
import { AvaliadorServiceImpl } from './avaliador';

@Module({
  imports: [InfraModule],
  providers: [
    {
      provide: AuthService,
      useClass: AuthServiceImpl,
    },
    {
      provide: AvaliadorService,
      useClass: AvaliadorServiceImpl,
    },
  ],
  exports: [AuthService, AvaliadorService],
})
export class ServiceModule {}
