export class AnswerEvaluationDto {
  evaluation: 'correct' | 'incorrect' | 'partially correct';
  comment: string;
}
