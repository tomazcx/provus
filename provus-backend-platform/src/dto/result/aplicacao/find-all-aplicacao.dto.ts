import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';
import EstadoAplicacaoEnum from '../../../enums/estado-aplicacao.enum';
import { AvaliacaoDto } from '../avaliacao/avaliacao.dto';

export class FindAllAplicacaoDto {
  id: number;
  avaliacao: AvaliacaoDto;
  estado: EstadoAplicacaoEnum;
  codigoAcesso: string;
  dataInicio: string;
  dataFim: string;

  constructor(model: AplicacaoModel) {
    this.id = model.id;
    this.avaliacao = new AvaliacaoDto(model.avaliacao, '');
    this.estado = model.estado;
    this.dataInicio = model.dataInicio ? model.dataInicio.toISOString() : '';
    this.dataFim = model.dataFim ? model.dataFim.toISOString() : '';
  }
}
