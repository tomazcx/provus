import { Module } from '@nestjs/common';
import { AssessmentControllersModule } from './assessment/assessment-controllers.module';
import { AuthControllersModule } from './auth/auth-controllers.module';
import { QuestionControllersModule } from './question/question-controllers.module';

@Module({
  imports: [
    AuthControllersModule,
    AssessmentControllersModule,
    QuestionControllersModule,
  ],
})
export class ControllersModule {}
