import {
  Entity,
  Column,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ItemSistemaArquivosModel } from './item-sistema-arquivos.model';
import { AlternativaModel } from './alternativa.model';
import { ConfiguracoesRandomizacaoModel } from './configuracoes-randomizacao.model';
import { QuestoesAvaliacoesModel } from './questoes-avaliacoes.model';
import { SubmissaoRespostasModel } from './submissao-respostas.model';
import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';

@Entity('questao')
export class QuestaoModel {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => ItemSistemaArquivosModel, { eager: true, cascade: true })
  @JoinColumn({ name: 'id' })
  item: ItemSistemaArquivosModel;

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
