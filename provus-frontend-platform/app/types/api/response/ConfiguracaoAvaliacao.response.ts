import type DificuldadeRandomizacaoEnum from "~/enums/DificuldadeRandomizacaoEnum";
import type TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import type TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import type { QuestaoApiResponse } from "./Questao.response";

interface PunicaoPorOcorrenciaApiResponse {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
  sempre: boolean;
  quantidadeAplicacoes: number | null;
}

interface ConfiguracaoRandomizacaoApiResponse {
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  questoes: QuestaoApiResponse[];
}

interface ConfiguracoesGeraisApiResponse {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: string | null;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  exibirPontuacaoQuestoes: boolean;
  configuracoesRandomizacao: ConfiguracaoRandomizacaoApiResponse[];
}

interface ConfiguracoesSegurancaApiResponse {
  proibirTrocarAbas: boolean;
  proibirCopiarColar: boolean;
  quantidadeTentativas: number;
  quantidadeAcessosSimultaneos: number;
  ativarCorrecaoDiscursivaViaIa: boolean;
  punicoes: PunicaoPorOcorrenciaApiResponse[];
  notificacoes: { tipoNotificacao: TipoNotificacaoEnum }[];
}

export interface ConfiguracaoAvaliacaoApiResponse {
  configuracoesGerais: ConfiguracoesGeraisApiResponse;
  configuracoesSeguranca: ConfiguracoesSegurancaApiResponse;
}
