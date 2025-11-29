import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import { AvaliacaoModel } from './avaliacao.model';
import { SubmissaoModel } from './submissao.model';
import { ConfiguracaoAvaliacaoModel } from './configuracao-avaliacao.model';

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

  @OneToOne(() => ConfiguracaoAvaliacaoModel, { cascade: true, eager: true })
  @JoinColumn({ name: 'configuracao_aplicacao_id' })
  configuracao: ConfiguracaoAvaliacaoModel;

  @OneToMany(() => SubmissaoModel, (submissao) => submissao.aplicacao)
  submissoes: SubmissaoModel[];

  @Column({
    name: 'paused_at',
    type: 'timestamp with time zone',
    nullable: true,
    default: null,
  })
  pausedAt: Date | null;
}
