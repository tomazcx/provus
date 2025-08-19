import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ItemSistemaArquivosModel } from './item-sistema-arquivos.model';

@Entity('arquivo')
export class ArquivoModel {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => ItemSistemaArquivosModel, { eager: true, cascade: true })
  @JoinColumn({ name: 'id' })
  item: ItemSistemaArquivosModel;

  @Column()
  url: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ name: 'tamanho_em_bytes' })
  tamanhoEmBytes: number;
}
