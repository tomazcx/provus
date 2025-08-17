import type { Avaliador } from '../avaliador';
import { TipoItemEnum } from '../../enums/tipo-item.enum';

export abstract class ItemSistemaArquivos {
  id: number;
  titulo: string;
  criadoEm: Date;
  atualizadoEm: Date;
  abstract readonly tipo: TipoItemEnum;
  avaliador: Avaliador;
  pai?: ItemSistemaArquivos;
  filhos: ItemSistemaArquivos[];

  constructor() {
    this.filhos = [];
  }
}
