import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import { SubmissaoModel } from './submissao.model';
import { PunicaoPorOcorrenciaModel } from './punicao-por-ocorrencia.model';

@Entity('registro_punicao_por_ocorrencia')
export class RegistroPunicaoPorOcorrenciaModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo_infracao', type: 'enum', enum: TipoInfracaoEnum })
  tipoInfracao: TipoInfracaoEnum;

  @Column({ name: 'quantidade_ocorrencias', type: 'int' })
  quantidadeOcorrencias: number;

  @Column({ name: 'tipo_penalidade', type: 'enum', enum: TipoPenalidadeEnum })
  tipoPenalidade: TipoPenalidadeEnum;

  @Column({ name: 'pontuacao_perdida', type: 'int' })
  pontuacaoPerdida: number;

  @Column({ name: 'tempo_reduzido', type: 'int' })
  tempoReduzido: number;

  @ManyToOne(() => SubmissaoModel)
  @JoinColumn({ name: 'submissao_id' })
  submissao: SubmissaoModel;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @Column({ name: 'punicao_config_id', nullable: true })
  punicaoConfigId: number | null;

  @ManyToOne(
    () => PunicaoPorOcorrenciaModel,
    (punicaoConfig) => punicaoConfig.registrosDeAplicacao,
  )
  @JoinColumn({ name: 'punicao_config_id' })
  punicaoConfig: PunicaoPorOcorrenciaModel;
}
