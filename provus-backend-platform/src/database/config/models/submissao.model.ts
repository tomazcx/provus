import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstudanteModel } from './estudante.model';
import { SubmissaoRespostasModel } from './submissao-respostas.model';
import EstadoSubmissaoEnum from 'src/domain/enums/estado-submissao.enum';
import { AplicacaoModel } from './aplicacao.model';

@Entity('submissao')
export class SubmissaoModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash: string;

  @Column({ type: 'enum', enum: EstadoSubmissaoEnum })
  estado: EstadoSubmissaoEnum;

  @Column({
    name: 'pontuacao_total',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  pontuacaoTotal: number;

  @Column({ name: 'finalizado_em', type: 'timestamp' })
  finalizadoEm: Date;

  @Column({ name: 'codigo_entrega', nullable: true })
  codigoEntrega: number;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToOne(() => EstudanteModel, (estudante) => estudante.submissao, {
    cascade: true,
  })
  estudante: EstudanteModel;

  @ManyToOne(() => AplicacaoModel, (aplicacao) => aplicacao.submissoes)
  @JoinColumn({ name: 'aplicacao_id' })
  aplicacao: AplicacaoModel;

  @OneToMany(() => SubmissaoRespostasModel, (resposta) => resposta.submissao)
  respostas: SubmissaoRespostasModel[];
}
