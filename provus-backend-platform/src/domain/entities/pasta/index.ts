import { ItemSistemaArquivos } from '../item-sistema-arquivos';
import { TipoItemEnum } from '../../enums/tipo-item.enum';

export class Pasta extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.PASTA;
}
