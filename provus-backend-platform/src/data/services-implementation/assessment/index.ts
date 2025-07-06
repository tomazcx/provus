import { Injectable } from '@nestjs/common';
import { LLMProvider } from 'src/data/protocols/llm';
import {
  AnswerEvaluationDto,
  EvaluateAnswerDto,
} from 'src/domain/services/assessment/dto';
import { AssessmentService } from 'src/domain/services/assessment';

@Injectable()
export class AssessmentServiceImpl implements AssessmentService {
  constructor(private readonly llmProvider: LLMProvider) {}

  async evaluateAnswer(
    dto: EvaluateAnswerDto[],
  ): Promise<AnswerEvaluationDto[]> {
    return this.llmProvider.evaluateAnswer(dto);
  }
}
