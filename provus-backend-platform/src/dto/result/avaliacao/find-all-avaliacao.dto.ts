import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';

export class FindAllAvaliacaoDto {
  id: number;
  titulo: string;
  descricao: string;
  isModelo: boolean;
  criadoEm: string;
  atualizadoEm: string;

  tipo: TipoItemEnum;
  paiId: number | null;

  constructor(model: AvaliacaoModel) {
    this.id = model.id;
    this.titulo = model.item.titulo;
    this.descricao = model.descricao;
    this.isModelo = model.isModelo;
    this.criadoEm = model.item.criadoEm.toISOString();
    this.atualizadoEm = model.item.atualizadoEm.toISOString();

    this.tipo = model.item.tipo;
    this.paiId = model.item.paiId;
  }
}
