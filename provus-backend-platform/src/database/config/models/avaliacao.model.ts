import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ConfiguracaoAvaliacaoModel } from './configuracao-avaliacao.model';
import { QuestoesAvaliacoesModel } from './questoes-avaliacoes.model';
import { AplicacaoModel } from './aplicacao.model';
import { ItemSistemaArquivosModel } from './item-sistema-arquivos.model';
import { ArquivosAvaliacoesModel } from './arquivos-avaliacoes.model';

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

  @OneToMany(() => ArquivosAvaliacoesModel, (arquivo) => arquivo.avaliacao)
  arquivos: ArquivosAvaliacoesModel[];
}
