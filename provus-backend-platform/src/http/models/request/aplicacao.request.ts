import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateConfiguracaoAvaliacaoRequest } from './configuracao-avaliacao.request';

export class CreateQuestaoAplicacaoRequest {
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

export class CreateArquivoAplicacaoRequest {
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

export class CreateAplicacaoRequest {
  @ApiProperty({
    description: 'ID da aplicação',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  idAplicacao: number;

  @ApiProperty({
    description: 'Título da aplicacao',
    example: 'Avaliação de Matemática',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Descrição da aplicação',
    example: 'Avaliação de Matemática',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Configurações da aplicação',
    type: CreateConfiguracaoAvaliacaoRequest,
  })
  @ValidateNested()
  @Type(() => CreateConfiguracaoAvaliacaoRequest)
  configuracoesAplicacao: CreateConfiguracaoAvaliacaoRequest;

  @ApiProperty({
    description: 'Questões da avaliação',
    type: [CreateQuestaoAplicacaoRequest],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestaoAplicacaoRequest)
  questoes: CreateQuestaoAplicacaoRequest[];

  @ApiProperty({
    description: 'Arquivos da avaliação',
    type: [CreateArquivoAplicacaoRequest],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArquivoAplicacaoRequest)
  arquivos: CreateArquivoAplicacaoRequest[];

  @ApiProperty({
    description: 'Estado da aplicação',
    example: 'CRIADA',
  })
  @IsString()
  @IsNotEmpty()
  estado: EstadoAplicacaoEnum;
}
