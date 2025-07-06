import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/data/services-implementation/services.module';
import { EvaluateAnswerController } from './evaluate-answer/controller';

@Module({
  imports: [ServiceModule],
  controllers: [EvaluateAnswerController],
})
export class AssessmentControllersModule {}
