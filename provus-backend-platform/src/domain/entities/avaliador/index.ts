import { ItemSistemaArquivos } from '../item-sistema-arquivos';
export class Avaliador {
  id: number;
  nome: string;
  email: string;
  senha: string;
  criadoEm: Date;
  atualizadoEm: Date;
  itemSistemaArquivos: ItemSistemaArquivos[];
}
