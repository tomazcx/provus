import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestaoModel } from '../questao';

@Entity('alternativa')
export class AlternativaModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ name: 'is_correto' })
  isCorreto: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => QuestaoModel, (questao) => questao.alternativas)
  @JoinColumn({ name: 'questao_id' })
  questao: QuestaoModel;
}
