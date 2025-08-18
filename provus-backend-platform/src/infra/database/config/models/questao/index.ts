import { ChildEntity, Column, JoinTable, ManyToMany, OneToMany } from 'typeorm';
// Enums
import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import { ItemSistemaArquivosModel } from '../item-sistema-arquivos';
import { AlternativaModel } from '../alternativa';
import { ConfiguracoesRandomizacaoModel } from '../configuracoes-randomizacao';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';
import { QuestoesAvaliacoesModel } from '../questoes-avaliacoes';
import { SubmissaoRespostasModel } from '../submissao-respostas';

@ChildEntity('QUESTAO')
export class QuestaoModel extends ItemSistemaArquivosModel {
  @Column({ type: 'enum', enum: DificuldadeQuestaoEnum })
  dificuldade: DificuldadeQuestaoEnum;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'text', nullable: true })
  exemploResposta: string;

  @Column()
  pontuacao: number;

  @Column()
  isModelo: boolean;

  @Column({ name: 'tipo_questao', type: 'enum', enum: TipoQuestaoEnum })
  tipoQuestao: TipoQuestaoEnum;

  @Column({ name: 'texto_revisao', type: 'text', nullable: true })
  textoRevisao: string;

  @OneToMany(() => AlternativaModel, (alternativa) => alternativa.questao, {
    cascade: true,
  })
  alternativas: AlternativaModel[];

  @OneToMany(() => QuestoesAvaliacoesModel, (qa) => qa.questao)
  avaliacoes: QuestoesAvaliacoesModel[];

  @OneToMany(() => SubmissaoRespostasModel, (resposta) => resposta.questao)
  submissoesRespostas: SubmissaoRespostasModel[];

  @ManyToMany(
    () => ConfiguracoesRandomizacaoModel,
    (config) => config.poolDeQuestoes,
  )
  @JoinTable({
    name: 'pool_questoes_randomizacao',
    joinColumn: { name: 'questao_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'configuracao_randomizacao_id',
      referencedColumnName: 'id',
    },
  })
  configuracoesRandomizacao: ConfiguracoesRandomizacaoModel[];
}
