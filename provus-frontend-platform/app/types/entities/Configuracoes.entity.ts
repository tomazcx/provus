import type TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import type TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import type { QuestaoEntity } from "./Questao.entity";
import type DificuldadeRandomizacaoEnum from "~/enums/DificuldadeRandomizacaoEnum";
import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

export interface PunicaoPorOcorrenciaEntity {
  tipoInfracao: TipoInfracaoEnum;
  quantidadeOcorrencias: number;
  tipoPenalidade: TipoPenalidadeEnum;
  pontuacaoPerdida: number;
  tempoReduzido: number;
  sempre: boolean;
  quantidadeAplicacoes: number | null;
}

export interface RegraGeracaoIaEntity {
  id: number;
  quantidade: number;
  tipo: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
  materiaisAnexadosIds: number[];
}

export interface RandomizationRuleEntity {
  id: number;
  tipo: TipoRandomizacaoEnum;
  dificuldade: DificuldadeRandomizacaoEnum;
  quantidade: number;
  questoes: QuestaoEntity[];
}

export interface ConfiguracoesGeraisEntity {
  tempoMaximo: number;
  tempoMinimo: number;
  tipoAplicacao: TipoAplicacaoEnum;
  dataAgendamento: Date | null;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
  permitirMultiplosEnvios: boolean;
  exibirPontuacaoQuestoes: boolean;
  configuracoesRandomizacao: RandomizationRuleEntity[];
}

export interface ConfiguracoesSegurancaEntity {
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
  punicoes: PunicaoPorOcorrenciaEntity[];
  ipsPermitidos: string[];
  notificacoes: TipoNotificacaoEnum[];
}

export interface ConfiguracoesEntity {
  configuracoesGerais: ConfiguracoesGeraisEntity;
  configuracoesSeguranca: ConfiguracoesSegurancaEntity;
}
