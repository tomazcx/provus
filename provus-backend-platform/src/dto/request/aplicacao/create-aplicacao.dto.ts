import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';

export class CreateAplicacaoDto {
  avaliacaoId: number;
  estado: EstadoAplicacaoEnum;
  dataInicio?: string;
}
