import EstadoAplicacaoEnum from 'src/domain/enums/estado-aplicacao.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AvaliacaoModel } from '../avaliacao';
import { SubmissaoModel } from '../submissao';

@Entity('aplicacao')
export class AplicacaoModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_acesso' })
  codigoAcesso: string;

  @Column({ name: 'data_inicio' })
  dataInicio: Date;

  @Column({ name: 'data_fim' })
  dataFim: Date;

  @Column({ type: 'enum', enum: EstadoAplicacaoEnum })
  estado: EstadoAplicacaoEnum;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => AvaliacaoModel, (avaliacao) => avaliacao.aplicacoes)
  @JoinColumn({ name: 'avaliacao_id' })
  avaliacao: AvaliacaoModel;

  @OneToMany(() => SubmissaoModel, (submissao) => submissao.aplicacao)
  submissoes: SubmissaoModel[];
}
