import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type EstadoRespostaEnum from "~/enums/EstadoRespostaEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import type { IQuestaoListItem } from "./IBank";

export interface IQuestaoDiscursiva extends IQuestaoListItem {
  tipoQuestao: TipoQuestaoEnum.DISCURSIVA;
  resposta?: IRespostaDiscursiva;
}

export interface IQuestaoObjetiva extends IQuestaoListItem {
  tipoQuestao: TipoQuestaoEnum.OBJETIVA;
  resposta?: IRespostaObjetiva;
}

export interface IQuestaoMultiplaEscolhaOuVerdadeiroOuFalso
  extends IQuestaoListItem {
  tipoQuestao:
    | TipoQuestaoEnum.MULTIPLA_ESCOLHA
    | TipoQuestaoEnum.VERDADEIRO_FALSO;
  resposta?: IRespostaMultiplaEscolha;
}

export type IQuestao =
  | IQuestaoDiscursiva
  | IQuestaoObjetiva
  | IQuestaoMultiplaEscolhaOuVerdadeiroOuFalso;

export interface IAlternativa {
  id?: number;
  descricao: string;
  isCorreto: boolean;
  questaoId?: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface IResposta {
  id?: number;
  textoRevisao?: string;
  submissaoId: number;
  questaoId: number;
  pontuacao?: number;
  estadoProcessamento: EstadoRespostaEnum;
  estadoCorrecao: EstadoQuestaoCorrigida;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface IRespostaDiscursiva extends IResposta {
  dados: { texto: string };
}

export interface IRespostaObjetiva extends IResposta {
  dados: { alternativaId: number | undefined };
}

export interface IRespostaMultiplaEscolha extends IResposta {
  dados: { alternativasId: number[] };
}

export type TQuestionForm = {
  titulo: string;
  descricao?: string;
  tipoQuestao: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
  alternativas: IAlternativa[];
  exemploRespostaIa?: string;
  textoRevisao?: string;
};
