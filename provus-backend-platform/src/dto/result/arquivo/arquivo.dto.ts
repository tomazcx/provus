import { ArquivoModel } from 'src/database/config/models/arquivo.model';

export class ArquivoDto {
  id: number;
  titulo: string;
  url: string;
  descricao?: string;
  tamanhoEmBytes: number;
  paiId: number | null;
  path?: string;
  criadoEm: string;
  atualizadoEm: string;

  constructor(model: ArquivoModel, path?: string) {
    this.id = model.id;
    this.titulo = model.item.titulo;
    this.url = model.url;
    this.descricao = model.descricao;
    this.tamanhoEmBytes = model.tamanhoEmBytes;
    this.paiId = model.item.pai ? model.item.pai.id : null;
    this.criadoEm = model.item.criadoEm.toISOString();
    this.atualizadoEm = model.item.atualizadoEm.toISOString();
    this.path = path;
  }
}
