import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

export class GenerateAiQuestaoRequestDto {
  @ApiProperty({
    description: 'Assunto principal da questão a ser gerada.',
    example: 'Revolução Francesa',
  })
  @IsString()
  @IsNotEmpty()
  assunto: string;

  @ApiProperty({
    description: 'O nível de dificuldade da questão.',
    enum: DificuldadeQuestaoEnum,
    example: DificuldadeQuestaoEnum.MEDIO,
  })
  @IsEnum(DificuldadeQuestaoEnum)
  @IsNotEmpty()
  dificuldade: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'A quantidade de questões que devem ser geradas.',
    example: 3,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantidade: number;

  @ApiProperty({
    description: 'O tipo da questão a ser gerada.',
    enum: TipoQuestaoEnum,
    example: TipoQuestaoEnum.MULTIPLA_ESCOLHA,
  })
  @IsEnum(TipoQuestaoEnum)
  @IsNotEmpty()
  tipoQuestao: TipoQuestaoEnum;

  @ApiProperty({
    description:
      'ID da pasta onde as questões serão salvas (opcional, usado para salvar direto no banco).',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  paiId?: number;
}
