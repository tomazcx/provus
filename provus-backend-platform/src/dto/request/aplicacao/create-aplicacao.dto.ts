import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';

export class CreateAplicacaoDto {
  @IsInt()
  @IsNotEmpty()
  avaliacaoId: number;

  @IsEnum(EstadoAplicacaoEnum)
  @IsNotEmpty()
  estado: EstadoAplicacaoEnum;
}
