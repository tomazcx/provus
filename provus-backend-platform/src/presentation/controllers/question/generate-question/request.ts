import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from 'src/domain/services/question/dto';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class AssessmentQuestion {
  @ApiProperty({
    description: 'The question',
    example: 'Exemplo de uma questão da avaliação',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The correct answer',
    example: 'Exemplo da resposta correta da questão',
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

export class GenerateQuestionRequest {
  @ApiProperty({
    description: 'The subject of the assessment',
    example: 'A matéria da avaliação',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'The content of the assessment',
    example: 'Exemplo do conteúdo da avaliação',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The difficulty of the question',
    example: Difficulty.EASY,
  })
  @IsEnum(Difficulty)
  @IsNotEmpty()
  difficulty: Difficulty;

  @ApiProperty({
    description: 'The theme of the question',
    example: 'Exemplo do tema da questão. Opcional',
  })
  @IsString()
  @IsOptional()
  questionTheme?: string;

  @ApiProperty({
    description: 'The questions',
    type: [AssessmentQuestion],
  })
  @IsArray()
  @IsNotEmpty()
  @Type(() => AssessmentQuestion)
  questions: AssessmentQuestion[];
}
