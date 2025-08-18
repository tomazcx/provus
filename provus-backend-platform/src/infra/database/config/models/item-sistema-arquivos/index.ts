import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { AvaliadorModel } from '../avaliador';

@Entity('item_sistema_arquivos')
@Tree('adjacency-list')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export abstract class ItemSistemaArquivosModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @TreeParent()
  @JoinColumn({ name: 'pai_id' })
  pai: ItemSistemaArquivosModel;

  @ManyToOne(() => AvaliadorModel, (avaliador) => avaliador.itemSistemaArquivos)
  @JoinColumn({ name: 'avaliador_id' })
  avaliador: AvaliadorModel;

  @TreeChildren()
  filhos: ItemSistemaArquivosModel[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
