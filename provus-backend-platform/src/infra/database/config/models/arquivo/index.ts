import { ChildEntity, Column } from 'typeorm';
import { ItemSistemaArquivosModel } from '../item-sistema-arquivos';

@ChildEntity('ARQUIVO')
export class ArquivoModel extends ItemSistemaArquivosModel {
  @Column()
  url: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ name: 'tamanho_em_bytes' })
  tamanhoEmBytes: number;
}
