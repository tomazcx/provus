import { TipoItemEnum } from 'src/domain/enums/tipo-item.enum';
import { ItemSistemaArquivos } from '../item-sistema-arquivos';

export class Arquivo extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.ARQUIVO;

  id: number;
  url: string;
  descricao: string;
  tamanhoEmBytes: number;
}
