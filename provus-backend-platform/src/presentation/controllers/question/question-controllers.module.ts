import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/data/services-implementation/services.module';
import { GenerateQuestionController } from './';

@Module({
  imports: [ServiceModule],
  controllers: [GenerateQuestionController],
})
export class QuestionControllersModule {}
