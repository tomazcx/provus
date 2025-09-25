import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubmissaoModel } from './submissao.model';

@Entity('estudante')
export class EstudanteModel {
  @PrimaryColumn({ name: 'submissao_id' })
  id: number;

  @PrimaryColumn()
  email: string;

  @Column()
  nome: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({
    name: 'atualizado_em',
    type: 'timestamp',
    nullable: true,
  })
  atualizadoEm: Date;

  @OneToOne(() => SubmissaoModel, (submissao) => submissao.estudante)
  @JoinColumn({ name: 'submissao_id' })
  submissao: SubmissaoModel;
}
