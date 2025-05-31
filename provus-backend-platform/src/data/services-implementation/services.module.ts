import { Module } from '@nestjs/common';
import { AuthServiceImpl } from './auth';
import { AuthService } from 'src/domain/services';
import { InfraModule } from 'src/infra/infra.module';

@Module({
  imports: [InfraModule],
  providers: [
    {
      provide: AuthService,
      useClass: AuthServiceImpl,
    },
  ],
  exports: [AuthService],
})
export class ServiceModule {}