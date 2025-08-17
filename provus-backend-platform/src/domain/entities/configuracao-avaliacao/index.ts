import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoAplicacaoEnum from 'src/domain/enums/tipo-aplicacao.enum';
import TipoInfracaoEnum from 'src/domain/enums/tipo-infracao.enum';
import TipoNotificacaoEnum from 'src/domain/enums/tipo-notificacao.enum';
import TipoPenalidadeEnum from 'src/domain/enums/tipo-penalidade.enum';
import TipoRandomizacaoEnum from 'src/domain/enums/tipo-randomizacao.enum';

export interface IRegraRandomizacao {
  id?: number;
  quantidade: number;
  dificuldade: DificuldadeQuestaoEnum | 'Qualquer';
}

export interface IPunicao {
  id: number;
  tipo: TipoPenalidadeEnum | null;
  valor?: number;
}

export interface IRegraDeOcorrencia {
  id: number;
  ocorrencias: number;
  punicoes: IPunicao[];
}

export interface IRegraSeguranca {
  ativo: boolean;
  descricao: string;
  regrasDeOcorrencia: IRegraDeOcorrencia[];
}

export class ConfiguracaoAvaliacao {
  id: number;
  autocorrecaoIa: boolean;
  numeroMaximoDeEnvios: number;
  tempoMaximo: number;
  tempoMinimo: number;
  tipoRandomizacao: TipoRandomizacaoEnum | null;
  tipoAplicacao: TipoAplicacaoEnum | null;
  regrasRandomizacaoConfiguravel: IRegraRandomizacao[];
  dataAgendada: Date | null;
  exibirPontuacaoDaSubmissao: boolean;
  permitirRevisao: boolean;
  exibirPontuacaoQuestoes: boolean;
  ativarAlertas: boolean;
  quantidadeDeAlertas: number;
  duracaoDoAlerta: number;
  permitirFecharAlerta: boolean;
  ativarNotificacoes: boolean;
  tipoNotificacao: TipoNotificacaoEnum[] | null;
  regrasDeSeguranca: Record<TipoInfracaoEnum, IRegraSeguranca>;
  permitirConsulta: boolean;
}
