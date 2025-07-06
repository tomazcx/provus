import { Injectable } from '@nestjs/common';
import { LLMProvider } from 'src/data/protocols/llm';
import { QuestionService } from 'src/domain/services/question';
import { GenerateQuestionDto } from 'src/data/protocols/llm/dto';

@Injectable()
export class QuestionServiceImpl implements QuestionService {
  constructor(private readonly llmProvider: LLMProvider) {}

  async generateQuestion(dto: GenerateQuestionDto): Promise<{
    question: string;
    correctAnswer: string;
  }> {
    return this.llmProvider.generateQuestion(dto);
  }
}
