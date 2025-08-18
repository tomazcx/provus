import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubmissaoModel } from '../submissao';

@Entity('estudante')
export class EstudanteModel {
  @PrimaryColumn({ name: 'submissao_id' })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nome: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToOne(() => SubmissaoModel, (submissao) => submissao.estudante)
  @JoinColumn({ name: 'submissao_id' })
  submissao: SubmissaoModel;
}
