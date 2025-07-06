import { GenerateQuestionDto } from 'src/data/protocols/llm/dto';

export abstract class QuestionService {
  abstract generateQuestion(dto: GenerateQuestionDto): Promise<{
    question: string;
    correctAnswer: string;
  }>;
}
