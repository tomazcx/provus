import TipoItemEnum from '../enums/tipo-item.enum';
import { ItemSistemaArquivos } from './item-sistema-arquivos.entity';

export class Pasta extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.PASTA;
}
