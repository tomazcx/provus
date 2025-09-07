import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateConfiguracaoAvaliacaoRequest } from './configuracao-avaliacao.request';

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
}
