import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { AvaliadorModel } from './avaliador.model';
import TipoItemEnum from 'src/domain/enums/tipo-item.enum';

@Entity('item_sistema_arquivos')
@Tree('adjacency-list')
export class ItemSistemaArquivosModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @TreeParent()
  @JoinColumn({ name: 'pai_id' })
  pai: ItemSistemaArquivosModel;

  @Column({ type: 'enum', enum: TipoItemEnum })
  tipo: TipoItemEnum;

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
