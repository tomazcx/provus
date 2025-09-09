import { AvaliacaoModel } from 'src/database/config/models/avaliacao.model';

export class FindAllAvaliacaoDto {
  id: number;
  titulo: string;
  descricao: string;
  isModelo: boolean;
  criadoEm: string;
  atualizadoEm: string;

  constructor(model: AvaliacaoModel) {
    this.id = model.id;
    this.titulo = model.item.titulo;
    this.descricao = model.descricao;
    this.isModelo = model.isModelo;
    this.criadoEm = model.item.criadoEm.toISOString();
    this.atualizadoEm = model.item.atualizadoEm.toISOString();
  }
}
