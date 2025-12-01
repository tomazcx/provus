import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

export class GenerateQuestaoFromFileRequestDto {
  @ApiProperty({
    description: 'IDs dos arquivos já existentes no sistema.',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  arquivoIds?: number[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Novos arquivos para upload (limite de 2).',
    required: false,
  })
  files?: any[];

  @ApiProperty({
    description:
      'Um tópico ou assunto para guiar a IA na criação das questões. Se omitido, a IA usará o tema geral dos arquivos.',
    example: 'Segunda Guerra Mundial',
    required: false,
  })
  @IsString()
  @IsOptional()
  assunto?: string;

  @ApiProperty({
    description: 'O nível de dificuldade da questão.',
    enum: DificuldadeQuestaoEnum,
    example: DificuldadeQuestaoEnum.DIFICIL,
  })
  @IsEnum(DificuldadeQuestaoEnum)
  @IsNotEmpty()
  dificuldade: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'O tipo da questão a ser gerada.',
    enum: TipoQuestaoEnum,
    example: TipoQuestaoEnum.OBJETIVA,
  })
  @IsEnum(TipoQuestaoEnum)
  @IsNotEmpty()
  tipoQuestao: TipoQuestaoEnum;

  @ApiProperty({
    description: 'A quantidade de questões que devem ser geradas.',
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  quantidade: number;

  @IsOptional()
  @IsNumber()
  paiId?: number;
}
