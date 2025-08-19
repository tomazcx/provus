import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AvaliacaoModel } from '../avaliacao';
import { QuestaoModel } from '../questao';

@Entity('questoes_avaliacoes')
export class QuestoesAvaliacoesModel {
  @PrimaryColumn({ name: 'questao_id' })
  questaoId: number;

  @PrimaryColumn({ name: 'avaliacao_id' })
  avaliacaoId: number;

  @Column()
  ordem: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pontuacao: number;

  @ManyToOne(() => QuestaoModel, (questao) => questao.avaliacoes)
  @JoinColumn({ name: 'questao_id' })
  questao: QuestaoModel;

  @ManyToOne(() => AvaliacaoModel, (avaliacao) => avaliacao.questoes)
  @JoinColumn({ name: 'avaliacao_id' })
  avaliacao: AvaliacaoModel;
}
