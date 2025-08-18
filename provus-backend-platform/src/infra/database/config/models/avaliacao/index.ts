import { ChildEntity, Column, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ConfiguracaoAvaliacaoModel } from '../configuracao-avaliacao';
import { ItemSistemaArquivosModel } from '../item-sistema-arquivos';
import { QuestoesAvaliacoesModel } from '../questoes-avaliacoes';
import { AplicacaoModel } from '../aplicacao';

@ChildEntity('AVALIACAO')
export class AvaliacaoModel extends ItemSistemaArquivosModel {
  @Column()
  descricao: string;

  @Column('is_modelo')
  isModelo: boolean;

  @OneToOne(() => ConfiguracaoAvaliacaoModel, { cascade: true, eager: true })
  @JoinColumn({ name: 'configuracao_avaliacao_id' })
  configuracaoAvaliacao: ConfiguracaoAvaliacaoModel;

  @OneToMany(() => QuestoesAvaliacoesModel, (qa) => qa.avaliacao)
  questoes: QuestoesAvaliacoesModel[];

  @OneToMany(() => AplicacaoModel, (aplicacao) => aplicacao.avaliacao)
  aplicacoes: AplicacaoModel[];
}
