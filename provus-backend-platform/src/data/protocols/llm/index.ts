import {
  AnswerEvaluationDto,
  EvaluateAnswerDto,
  GenerateQuestionDto,
} from './dto';

export abstract class LLMProvider {
  abstract generateQuestion(dto: GenerateQuestionDto): Promise<{
    question: string;
    correctAnswer: string;
  }>;
  abstract evaluateAnswer(
    dto: EvaluateAnswerDto[],
  ): Promise<AnswerEvaluationDto[]>;
}
