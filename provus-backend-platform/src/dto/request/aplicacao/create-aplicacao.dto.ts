import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';

export class CreateAplicacaoDto {
  @ApiProperty({
    description: 'ID da avaliação base para criar a aplicação',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  avaliacaoId: number;

  @ApiProperty({
    description: 'Estado inicial da aplicação',
    example: EstadoAplicacaoEnum.AGENDADA,
    enum: EstadoAplicacaoEnum,
  })
  @IsEnum(EstadoAplicacaoEnum)
  @IsNotEmpty()
  estado: EstadoAplicacaoEnum;
}
