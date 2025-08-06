import type TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import type TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import type { IQuestao } from "./IQuestao";
import type { IFile } from "./IFile";

export interface IRandomizationRule {
  id?: number;
  quantidade: number;
  dificuldade: "Qualquer" | "Fácil" | "Médio" | "Difícil";
  grupo: {
    pastas: number[];
    questoes: IQuestao[];
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
  autocorrecaoIa?: boolean;
  numeroMaximoDeEnvios?: number;
  tempoMaximo?: number;
  tempoMinimo?: number;
  criadoEm?: string;
  atualizadoEm?: string;
  poolSelecaoBanco: {
    pastas: number[];
    questoes: IQuestao[];
  };

  tipoRandomizacao: TipoRandomizacaoEnum | null;
  tipoAplicacao: TipoAplicacaoEnum | null;
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

  permitirConsulta?: boolean;
  materiaisAnexados?: {
    pastas: number[]; 
    arquivos: IFile[]; 
  };
}
