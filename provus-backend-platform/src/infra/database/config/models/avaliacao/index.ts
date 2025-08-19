import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ConfiguracaoAvaliacaoModel } from '../configuracao-avaliacao';
import { QuestoesAvaliacoesModel } from '../questoes-avaliacoes';
import { AplicacaoModel } from '../aplicacao';
import { ItemSistemaArquivosModel } from '../item-sistema-arquivos';

@Entity('avaliacao')
export class AvaliacaoModel {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => ItemSistemaArquivosModel, { eager: true, cascade: true })
  @JoinColumn({ name: 'id' })
  item: ItemSistemaArquivosModel;

  @Column()
  descricao: string;

  @Column({ name: 'is_modelo' })
  isModelo: boolean;

  @OneToOne(() => ConfiguracaoAvaliacaoModel, { cascade: true, eager: true })
  @JoinColumn({ name: 'configuracao_avaliacao_id' })
  configuracaoAvaliacao: ConfiguracaoAvaliacaoModel;

  @OneToMany(() => QuestoesAvaliacoesModel, (qa) => qa.avaliacao)
  questoes: QuestoesAvaliacoesModel[];

  @OneToMany(() => AplicacaoModel, (aplicacao) => aplicacao.avaliacao)
  aplicacoes: AplicacaoModel[];
}
