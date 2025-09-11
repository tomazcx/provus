import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import { AvaliacaoDto } from '../avaliacao/avaliacao.dto';

export class AplicacaoDto {
  id: number;
  avaliacao: AvaliacaoDto;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: string;
  dataFim: string;

  constructor(model: AplicacaoModel) {
    this.id = model.id;
    this.avaliacao = new AvaliacaoDto(model.avaliacao, '');
    this.codigoAcesso = model.codigoAcesso;
    this.estado = model.estado;
    this.dataInicio = model.dataInicio.toISOString();
    this.dataFim = model.dataFim.toISOString();
  }
}
