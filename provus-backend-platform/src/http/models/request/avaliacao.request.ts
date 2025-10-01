import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
import { CreateConfiguracaoAvaliacaoRequest } from './configuracao-avaliacao.request';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { CreateAlternativaRequest } from 'src/http/controllers/backoffice/alternativa/create-alternativa.request';

export class CreateQuestaoAvaliacaoRequest {
  @ApiProperty({
    description: 'ID da questão, se já existir no banco',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  questaoId?: number;

  @ApiProperty({ description: 'Ordem da questão na avaliação', example: 1 })
  @IsInt()
  @IsNotEmpty()
  ordem: number;

  @ApiProperty({
    description: 'Pontuação da questão nesta avaliação',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  pontuacao: number;

  @ApiProperty({ description: 'Título da nova questão', required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ description: 'Descrição da nova questão', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Tipo da nova questão',
    enum: TipoQuestaoEnum,
    required: false,
  })
  @IsEnum(TipoQuestaoEnum)
  @IsOptional()
  tipoQuestao?: TipoQuestaoEnum;

  @ApiProperty({
    description: 'Dificuldade da nova questão',
    enum: DificuldadeQuestaoEnum,
    required: false,
  })
  @IsEnum(DificuldadeQuestaoEnum)
  @IsOptional()
  dificuldade?: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'Alternativas da nova questão',
    type: [CreateAlternativaRequest],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAlternativaRequest)
  @IsOptional()
  alternativas?: CreateAlternativaRequest[];

  @ApiProperty({
    description: 'Exemplo de resposta para correção com I.A.',
    required: false,
  })
  @IsString()
  @IsOptional()
  exemploRespostaIa?: string;

  @ApiProperty({
    description: 'Texto de apoio para revisão da questão.',
    required: false,
  })
  @IsString()
  @IsOptional()
  textoRevisao?: string;
}

export class CreateArquivoAvaliacaoRequest {
  @ApiProperty({
    description: 'ID do arquivo',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  arquivoId: number;

  @ApiProperty({
    description: 'Permitir consulta por estudante',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  permitirConsultaPorEstudante: boolean;
}

export class CreateAvaliacaoRequest {
  @ApiProperty({
    description: 'Título da avaliação',
    example: 'Avaliação de Matemática',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Descrição da avaliação',
    example: 'Avaliação de Matemática',
  })
  @IsString()
  @IsOptional()
  descricao: string;

  @ApiProperty({
    description: 'Se a avaliação é um modelo',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isModelo: boolean;

  @ApiProperty({
    description: 'ID da pasta onde a avaliação será criada',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  paiId?: number;

  @ApiProperty({
    description: 'Configurações da avaliação',
    type: CreateConfiguracaoAvaliacaoRequest,
  })
  @ValidateNested()
  @Type(() => CreateConfiguracaoAvaliacaoRequest)
  configuracoesAvaliacao: CreateConfiguracaoAvaliacaoRequest;

  @ApiProperty({
    description: 'Questões da avaliação',
    type: [CreateQuestaoAvaliacaoRequest],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestaoAvaliacaoRequest)
  questoes: CreateQuestaoAvaliacaoRequest[];

  @ApiProperty({
    description: 'Arquivos da avaliação',
    type: [CreateArquivoAvaliacaoRequest],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArquivoAvaliacaoRequest)
  arquivos: CreateArquivoAvaliacaoRequest[];
}
