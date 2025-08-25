import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';
import { UpdateAlternativaDto } from '../../alternativa/update-alternativa.request';

export class UpdateQuestaoRequest {
  @ApiProperty({
    description: 'O novo título para a questão.',
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    description: 'A nova dificuldade da questão.',
    enum: DificuldadeQuestaoEnum,
    required: false,
  })
  @IsEnum(DificuldadeQuestaoEnum)
  @IsOptional()
  dificuldade?: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'O novo tipo da questão.',
    enum: TipoQuestaoEnum,
    required: false,
  })
  @IsEnum(TipoQuestaoEnum)
  @IsOptional()
  tipoQuestao?: TipoQuestaoEnum;

  @ApiProperty({ description: 'A nova descrição da questão.', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ description: 'O novo exemplo de resposta.', required: false })
  @IsString()
  @IsOptional()
  exemploRespostaIa?: string;

  @ApiProperty({ description: 'O novo texto de revisão.', required: false })
  @IsString()
  @IsOptional()
  textoRevisao?: string;

  @ApiProperty({
    description: 'A nova pontuação padrão para a questão.',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  pontuacao?: number;

  @ApiProperty({
    description:
      'A lista completa e atualizada de alternativas para a questão. Se enviada, substituirá completamente as alternativas existentes.',
    type: [UpdateAlternativaDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAlternativaDto)
  @IsOptional()
  alternativas?: UpdateAlternativaDto[];
}
