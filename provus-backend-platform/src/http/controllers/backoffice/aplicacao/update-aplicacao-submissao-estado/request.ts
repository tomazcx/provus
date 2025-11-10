import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';

export class UpdateSubmissaoEstadoRequest {
  @ApiProperty({ description: 'Estado da submissão' })
  @IsEnum(EstadoSubmissaoEnum)
  @IsNotEmpty()
  estado: EstadoSubmissaoEnum;
}
