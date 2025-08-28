import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { CreateAlternativaRequest } from '../../alternativa/create-alternativa.request';

export class CreateQuestaoRequest {
  @ApiProperty({
    description: 'Título ou enunciado principal da questão.',
    example: 'Qual é a capital do Brasil?',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description:
      'ID da pasta (item do sistema de arquivos) onde a questão será criada. Se não for fornecido, será criada na raiz.',
    example: 15,
    required: false,
  })
  @IsInt()
  @IsOptional()
  paiId?: number;

  @ApiProperty({
    description: 'Nível de dificuldade da questão.',
    enum: DificuldadeQuestaoEnum,
    example: DificuldadeQuestaoEnum.FACIL,
  })
  @IsEnum(DificuldadeQuestaoEnum)
  @IsNotEmpty()
  dificuldade: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'O tipo da questão (objetiva, discursiva, etc.).',
    enum: TipoQuestaoEnum,
    example: TipoQuestaoEnum.MULTIPLA_ESCOLHA,
  })
  @IsEnum(TipoQuestaoEnum)
  @IsNotEmpty()
  tipoQuestao: TipoQuestaoEnum;

  @ApiProperty({
    description:
      'Indica se a questão deve ser salva como um modelo reutilizável.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isModelo: boolean;

  @ApiProperty({
    description: 'Descrição ou contexto adicional para a questão.',
    example: 'Considere a capital na data atual.',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description:
      'Exemplo de resposta para ser usado por sistemas de correção automática (IA).',
    example: 'Brasília',
    required: false,
  })
  @IsString()
  @IsOptional()
  exemploRespostaIa?: string;

  @ApiProperty({
    description: 'Pontuação da questão.',
    example: 5,
    required: false,
  })
  @IsInt()
  @IsOptional()
  pontuacao?: number;

  @ApiProperty({
    description: 'Texto de apoio para o avaliador durante a correção manual.',
    example: 'Aceitar "Brasília" ou "Distrito Federal".',
    required: false,
  })
  @IsString()
  @IsOptional()
  textoRevisao?: string;

  @ApiProperty({
    description:
      'Lista de alternativas para a questão (obrigatório para tipo MULTIPLA_ESCOLHA).',
    type: [CreateAlternativaRequest],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAlternativaRequest)
  @IsOptional()
  alternativas?: CreateAlternativaRequest[];
}
