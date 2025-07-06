import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

class Question {
  @ApiProperty({
    description: 'The question to evaluate',
    example: 'Exemplo da pergunta da questão',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The answer to evaluate',
    example: 'Resposta fornecida pelo aluno',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'The correct answer',
    example:
      'Resposta correta escrita pelo professor para auxiliar a avaliação pelo LLM',
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

export class EvaluateAnswerRequest {
  @ApiProperty({ type: [Question] })
  @IsArray()
  @Type(() => Question)
  questions: Question[];
}
