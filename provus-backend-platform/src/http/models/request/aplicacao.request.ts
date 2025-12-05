import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateAvaliacaoRequest } from './avaliacao.request';

export class CreateAplicacaoRequest {
  @ApiProperty({
    description:
      'ID da avaliação (obrigatório se não enviar avaliacaoTemporaria)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  avaliacaoId?: number;

  @ApiProperty({
    description:
      'Dados completos da avaliação para uso único (obrigatório se não enviar avaliacaoId)',
    type: CreateAvaliacaoRequest,
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateAvaliacaoRequest)
  @IsOptional()
  avaliacaoTemporaria?: CreateAvaliacaoRequest;

  @ApiProperty({
    description: 'Estado da aplicação',
    example: EstadoAplicacaoEnum.CRIADA,
    enum: EstadoAplicacaoEnum,
  })
  @IsEnum(EstadoAplicacaoEnum)
  @IsNotEmpty()
  estado: EstadoAplicacaoEnum;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;
}

export class UpdateAplicacaoRequest {
  @ApiProperty({
    description: 'Estado da aplicação',
    example: EstadoAplicacaoEnum.EM_ANDAMENTO,
    enum: EstadoAplicacaoEnum,
  })
  @IsEnum(EstadoAplicacaoEnum)
  @IsNotEmpty()
  estado: EstadoAplicacaoEnum;
}
