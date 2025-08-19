import TipoItemEnum from 'src/domain/enums/tipo-item.enum';
import { ItemSistemaArquivos } from './item-sistema-arquivos.entity';

export class Arquivo extends ItemSistemaArquivos {
  readonly tipo = TipoItemEnum.ARQUIVO;

  url: string;
  descricao: string;
  tamanhoEmBytes: number;
}
