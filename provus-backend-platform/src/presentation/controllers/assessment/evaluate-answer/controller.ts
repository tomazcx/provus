import { Controller, Post, Body } from '@nestjs/common';
import { AssessmentService } from 'src/domain/services/assessment';
import { EvaluateAnswerDecorators } from './decorators';
import { EvaluateAnswerResponse } from './response';
import { ApiTags } from '@nestjs/swagger';
import { EvaluateAnswerRequest } from './request';

@Controller('assessment')
@ApiTags('Assessment')
export class EvaluateAnswerController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('evaluate-answer')
  @EvaluateAnswerDecorators()
  async evaluateAnswer(
    @Body() dto: EvaluateAnswerRequest,
  ): Promise<EvaluateAnswerResponse> {
    const evaluation = await this.assessmentService.evaluateAnswer(dto.questions);

    return {
      evaluation,
    };
  }
}
