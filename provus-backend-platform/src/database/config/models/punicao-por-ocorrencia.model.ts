import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConfiguracoesSegurancaModel } from './configuracoes-seguranca.model';
import TipoPenalidadeEnum from 'src/enums/tipo-penalidade.enum';
import { RegistroPunicaoPorOcorrenciaModel } from './registro-punicao-por-ocorrencia.model';

@Entity('punicao_por_ocorrencia')
export class PunicaoPorOcorrenciaModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo_infracao', type: 'enum', enum: TipoInfracaoEnum })
  tipoInfracao: TipoInfracaoEnum;

  @Column({ name: 'quantidade_ocorrencias' })
  quantidadeOcorrencias: number;

  @Column({ default: false })
  sempre: boolean;

  @Column({ name: 'tipo_penalidade', type: 'enum', enum: TipoPenalidadeEnum })
  tipoPenalidade: TipoPenalidadeEnum;

  @Column({ name: 'pontuacao_perdida' })
  pontuacaoPerdida: number;

  @Column({ name: 'tempo_reduzido' })
  tempoReduzido: number;

  @Column({ name: 'configuracoes_seguranca_id' })
  configuracoesSegurancaId: number;

  @Column({ name: 'quantidade_aplicacoes', type: 'int', nullable: true })
  quantidadeAplicacoes: number | null;

  @OneToMany(
    () => RegistroPunicaoPorOcorrenciaModel,
    (registro) => registro.punicaoConfig,
  )
  registrosDeAplicacao: RegistroPunicaoPorOcorrenciaModel[];

  @ManyToOne(() => ConfiguracoesSegurancaModel, (config) => config.punicoes)
  @JoinColumn({ name: 'configuracoes_seguranca_id' })
  configuracaoSeguranca: ConfiguracoesSegurancaModel;
}
