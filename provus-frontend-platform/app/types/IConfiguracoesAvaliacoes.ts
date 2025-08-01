import type TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import type TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";

export interface IRandomizationRule {
  id?: number;
  quantidade: number;
  dificuldade: "Qualquer" | "Fácil" | "Médio" | "Difícil";
  grupo: {
    pastas: number[];
    questoes: number[];
  };
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

export interface IConfiguracoes {
  id?: number;
  avaliacaoId?: number;
  hasPontuacaoFixa?: boolean;
  pontuacaoTotalFixa?: number;
  dataDeAplicacao?: string;
  dataDeEncerramento?: string;
  mostrarPontuacao?: boolean;
  mostrarRespostas?: boolean;
  permitirMultiplosEnvios?: boolean;
  autocorrecaoIa?: boolean;
  numeroMaximoDeEnvios?: number;
  embaralharQuestoes?: boolean;
  embaralharAlternativas?: boolean;
  tempoMaximo?: number;
  tempoMinimo?: number;
  criadoEm?: string;
  atualizadoEm?: string;

  tipoRandomizacao: TipoRandomizacaoEnum | null;
  tipoAplicacao: TipoAplicacaoEnum | null;
  poolSelecaoBanco: {
    pastas: [];
    questoes: [];
  };
  regrasRandomizacaoConfiguravel: IRandomizationRule[];
  dataAgendada: Date | null;
  exibirPontuacaDaSubmissao: boolean;
  permitirRevisao: boolean;
  exibirPontuacaoQuestoes: boolean;
  ativarAlertas: boolean;
  quantidadeDeAlertas: number;
  duracaoDoAlerta: number;
  permitirFecharAlerta: boolean;
  ativarNotificacoes: boolean;
  tipoNotificacao: TipoNotificacaoEnum[] | null;

  quantidadeAcessosSimultaneos: number;
  ativarControleIp: boolean;
  ipsPermitidos: string[];

  regrasDeSeguranca: Record<TipoInfracaoEnum, IRegraSeguranca>;
}
