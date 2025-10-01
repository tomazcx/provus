import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { AvaliadorModel } from './avaliador.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { ArquivoModel } from './arquivo.model';
import { AvaliacaoModel } from './avaliacao.model';
import { QuestaoModel } from './questao.model';

@Entity('item_sistema_arquivos')
@Tree('adjacency-list')
export class ItemSistemaArquivosModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  childCount: number;

  @TreeParent()
  @JoinColumn({ name: 'pai_id' })
  pai: ItemSistemaArquivosModel;

  @Column({ name: 'pai_id', nullable: true })
  paiId: number | null;

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

  @OneToOne(() => QuestaoModel, (questao) => questao.item)
  questao: QuestaoModel;

  @OneToOne(() => AvaliacaoModel, (avaliacao) => avaliacao.item)
  avaliacao: AvaliacaoModel;

  @OneToOne(() => ArquivoModel, (arquivo) => arquivo.item)
  arquivo: ArquivoModel;
}
