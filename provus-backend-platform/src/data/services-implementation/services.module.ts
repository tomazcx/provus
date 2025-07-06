import { Module } from '@nestjs/common';
import { AssessmentService, AuthService, QuestionService } from 'src/domain/services';
import { InfraModule } from 'src/infra/infra.module';
import { AssessmentServiceImpl, AuthServiceImpl, QuestionServiceImpl } from './';

@Module({
  imports: [InfraModule],
  providers: [
    {
      provide: AuthService,
      useClass: AuthServiceImpl,
    },
    {
      provide: AssessmentService,
      useClass: AssessmentServiceImpl,
    },
    {
      provide: QuestionService,
      useClass: QuestionServiceImpl,
    },
  ],
  exports: [AuthService, AssessmentService, QuestionService],
})
export class ServiceModule {}
