import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConfiguracoesRandomizacaoModel } from './configuracoes-randomizacao.model';
import TipoAplicacaoEnum from 'src/enums/tipo-aplicacao.enum';
import { ConfiguracaoAvaliacaoModel } from './configuracao-avaliacao.model';

@Entity('configuracoes_gerais')
export class ConfiguracoesGeraisModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tempo_maximo' })
  tempoMaximo: number;

  @Column({ name: 'tempo_minimo' })
  tempoMinimo: number;

  @Column({ name: 'tipo_aplicacao', type: 'enum', enum: TipoAplicacaoEnum })
  tipoAplicacao: TipoAplicacaoEnum;

  @Column({ type: 'timestamp', name: 'data_agendamento', nullable: true })
  dataAgendamento: Date;

  @Column({ name: 'mostrar_pontuacao' })
  mostrarPontuacao: boolean;

  @Column({ name: 'permitir_revisao' })
  permitirRevisao: boolean;

  @Column({ name: 'permitir_multiplos_envios' })
  permitirMultiplosEnvios: boolean;

  @Column({ name: 'exibir_pontuacao_questoes' })
  exibirPontuacaoQuestoes: boolean;

  @Column({ name: 'permitir_consultar_anexos' })
  permitirConsultarAnexos: boolean;

  @OneToMany(
    () => ConfiguracoesRandomizacaoModel,
    (configuracao) => configuracao.configuracoesGerais,
  )
  configuracoesRandomizacao: ConfiguracoesRandomizacaoModel[];
}
