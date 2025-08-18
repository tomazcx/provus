import { ChildEntity } from 'typeorm';
import { ItemSistemaArquivosModel } from '../item-sistema-arquivos';

@ChildEntity('PASTA')
export class PastaModel extends ItemSistemaArquivosModel {}
