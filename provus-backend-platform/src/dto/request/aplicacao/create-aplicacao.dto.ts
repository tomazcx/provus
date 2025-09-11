import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import { AvaliacaoDto } from '../../result/avaliacao/avaliacao.dto';

export class CreateAplicacaoDto {
  avaliacao: AvaliacaoDto;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
}
