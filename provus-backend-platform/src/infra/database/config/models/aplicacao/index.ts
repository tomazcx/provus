import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AvaliacaoModel } from '../avaliacao';
import { SubmissaoModel } from '../submissao';
import EstadoAplicacaoEnum from 'src/domain/enums/estado-aplicacao.enum';

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

  @ManyToOne(() => AvaliacaoModel, (avaliacao) => avaliacao.aplicacoes)
  @JoinColumn({ name: 'avaliacao_id' })
  avaliacao: AvaliacaoModel;

  @OneToMany(() => SubmissaoModel, (submissao) => submissao.aplicacao)
  submissoes: SubmissaoModel[];
}
