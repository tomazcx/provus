import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';

export class UpdateAplicacaoDto {
  @ApiProperty({
    description: 'Novo estado da aplicação',
    example: EstadoAplicacaoEnum.AGENDADA,
    enum: EstadoAplicacaoEnum,
  })
  @IsEnum(EstadoAplicacaoEnum)
  @IsNotEmpty()
  estado: EstadoAplicacaoEnum;
}
