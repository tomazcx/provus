import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateConfiguracaoAvaliacaoRequest } from './configuracao-avaliacao.request';

export class CreateQuestaoAvaliacaoRequest {
  @ApiProperty({
    description: 'ID da questão',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  questaoId: number;

  @ApiProperty({
    description: 'Ordem da questão',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  ordem: number;

  @ApiProperty({
    description: 'Pontuação da questão',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  pontuacao: number;
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
  @IsNotEmpty()
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
