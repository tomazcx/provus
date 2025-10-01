import type DificuldadeRandomizacaoEnum from "~/enums/DificuldadeRandomizacaoEnum";
import type TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import type TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";

interface CreatePunicaoPorOcorrenciaRequest {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
}

interface CreateConfiguracoesRandomizacaoRequest {
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  questoes: number[];
}

interface CreateConfiguracoesGeraisRequest {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: string | null;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  exibirPontuacaoQuestoes: boolean;
  configuracoesRandomizacao: CreateConfiguracoesRandomizacaoRequest[];
}

interface CreateConfiguracoesSegurancaRequest {
  proibirTrocarAbas: boolean;
  proibirPrintScreen: boolean;
  proibirCopiarColar: boolean;
  proibirDevtools: boolean;
  quantidadeTentativas: number;
  quantidadeAcessosSimultaneos: number;
  ativarControleIp: boolean;
  duracaoAlertas: number;
  permitirFecharAlertas: boolean;
  ativarCorrecaoDiscursivaViaIa: boolean;
  punicoes: CreatePunicaoPorOcorrenciaRequest[];
  ipsPermitidos: string[];
  notificacoes: TipoNotificacaoEnum[];
}

export interface CreateConfiguracaoAvaliacaoRequest {
  configuracoesGerais: CreateConfiguracoesGeraisRequest;
  configuracoesSeguranca: CreateConfiguracoesSegurancaRequest;
}
