import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';

export class CreateSubmissaoDto {
  id: number;
  aplicacao_id: number;
  codigoEntrega?: number;
  hash: string;
  estado: EstadoSubmissaoEnum;
  pontuacaoTotal: number;
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm: string;

  constructor(model: SubmissaoModel) {
    this.id = model.id;
    this.aplicacao_id = model.aplicacao.id;
    this.codigoEntrega = model.codigoEntrega;
    this.hash = model.hash;
    this.estado = model.estado;
    this.pontuacaoTotal = model.pontuacaoTotal;
    this.criadoEm = model.criadoEm.toISOString();
    this.atualizadoEm = model.atualizadoEm.toISOString();
    this.finalizadoEm = model.finalizadoEm.toISOString();
  }
}
