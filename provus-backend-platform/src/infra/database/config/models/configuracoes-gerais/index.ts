import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConfiguracoesRandomizacaoModel } from '../configuracoes-randomizacao';
import TipoAplicacaoEnum from 'src/domain/enums/tipo-aplicacao.enum';

@Entity('configuracoes_gerais')
export class ConfiguracoesGeraisModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('tempo_maximo')
  tempoMaximo: number;

  @Column('tempo_minimo')
  tempoMinimo: number;

  @Column({ name: 'tipo_aplicacao', type: 'enum', enum: TipoAplicacaoEnum })
  tipoAplicacao: TipoAplicacaoEnum;

  @Column({ type: 'timestamp', name: 'data_agendamento', nullable: true })
  dataAgendamento: Date;

  @Column('mostrar_pontuacao')
  mostrarPontuacao: boolean;

  @Column('permitir_revisao')
  permitirRevisao: boolean;

  @Column('permitir_multiplos_envios')
  permitirMultiplosEnvios: boolean;

  @Column('exibir_pontuacao_questoes')
  exibirPontuacaoQuestoes: boolean;

  @Column('permitir_consultar_anexos')
  permitirConsultarAnexos: boolean;

  @OneToOne(() => ConfiguracoesRandomizacaoModel, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'configuracao_randomizacao_id' })
  configuracaoRandomizacao: ConfiguracoesRandomizacaoModel;
}
