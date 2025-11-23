import { ApiProperty } from '@nestjs/swagger';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateAplicacaoRequest {
  @ApiProperty({
    description: 'ID da avaliação',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  avaliacaoId: number;

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
