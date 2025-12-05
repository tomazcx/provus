import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import { CreateAvaliacaoRequest } from '../../../http/models/request/avaliacao.request';

export class CreateAplicacaoDto {
  avaliacaoId?: number;
  avaliacaoTemporaria?: CreateAvaliacaoRequest;
  estado: EstadoAplicacaoEnum;
  dataInicio?: string;
}
