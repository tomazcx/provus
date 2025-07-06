import { EvaluateAnswerDto, AnswerEvaluationDto } from './dto';

export abstract class AssessmentService {
  abstract evaluateAnswer(dto: EvaluateAnswerDto[]): Promise<AnswerEvaluationDto[]>;
}
