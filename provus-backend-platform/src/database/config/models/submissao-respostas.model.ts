import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestaoModel } from './questao.model';
import { SubmissaoModel } from './submissao.model';

@Entity('submissao_respostas')
export class SubmissaoRespostasModel {
  @PrimaryColumn({ name: 'submissao_id' })
  submissaoId: number;

  @PrimaryColumn({ name: 'questao_id' })
  questaoId: number;

  @Column({ name: 'ordem' })
  ordem: number;

  @Column({ type: 'jsonb', name: 'dados_resposta' })
  dadosResposta: any;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pontuacao: number;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => SubmissaoModel, (submissao) => submissao.respostas)
  @JoinColumn({ name: 'submissao_id' })
  submissao: SubmissaoModel;

  @ManyToOne(() => QuestaoModel, (questao) => questao.submissoesRespostas)
  @JoinColumn({ name: 'questao_id' })
  questao: QuestaoModel;
}
