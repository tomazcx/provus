import { ApiProperty } from '@nestjs/swagger';

class Evaluation {
  @ApiProperty({
    description: 'The evaluation of the answer',
    example: 'correct',
  })
  evaluation: string;

  @ApiProperty({
    description: 'The comment of the answer',
    example: 'The answer is correct',
  })
  comment: string;
}

export class EvaluateAnswerResponse {
  evaluation: Evaluation[];
}
