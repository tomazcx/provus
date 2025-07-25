import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type EstadoRespostaEnum from "~/enums/EstadoRespostaEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { ItemSistemaDeArquivos } from "./IBank";

export interface IQuestao extends ItemSistemaDeArquivos {
  id?: number;
  titulo: string;
  descricao?: string;
  dificuldade?: DificuldadeQuestaoEnum;
  exemploDeResposta?: string;
  pontuacao?: number;
  isModelo?: boolean;
  tipo: TipoQuestaoEnum;
  textoRevisao?: string;
  alternativas?: IAlternativa[];
  resposta?: IResposta;
}

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
  dados: JSON;
  textoRevisao?: string;
  submissaoId: number;
  questaoId: number;
  pontuacao?: number;
  estado: EstadoRespostaEnum;
  criadoEm?: string;
  atualizadoEm?: string;
}

// interface IQuestionBase {
//   id: number;
//   titulo: string;
//   materia?: string;
//   pontuacao?: number;
//   dificuldade?: TDifficulty;
//   explicacao?: string;
//   descricao?: string;
//   isModelo?: boolean;
//   criadoEm?: Date;
//   atualizadoEm?: Date;
// textoRevisao?: string;
// }

// export interface IQuestionAlternative {
//   id: number;
//   texto: string;
//   isCorreta: boolean;
// }

// export interface IQuestionObjective extends IQuestionBase {
//   tipo: { label: "Objetiva"; value: "objective" };
//   opcoes: IQuestionAlternative[];
// }

// export interface IQuestionMultipleChoice extends IQuestionBase {
//   tipo: { label: "Múltipla Escolha"; value: "multipla-escolha" };
//   opcoes: IQuestionAlternative[];
// }

// export interface IQuestionTrueOrFalse extends IQuestionBase {
//   tipo: { label: "Verdadeiro ou Falso"; value: "verdadeiro-falso" };
//   opcoes: IQuestionAlternative[];
// }

// export interface IQuestionDiscursive extends IQuestionBase {
//   tipo: { label: "Discursiva"; value: "discursiva" };
//   exemploDeResposta?: string;
// }

// export type AnyQuestion =
//   | IQuestionMultipleChoice
//   | IQuestionTrueOrFalse
//   | IQuestionObjective
//   | IQuestionDiscursive;

// export interface IProvaConfiguracoes {
//   embaralharQuestoes: boolean;
//   mostrarResultados: boolean;
//   permitirRefazer: boolean;
//   tentativasPermitidas: number | string;
//   correcaoIA: boolean;
//   tempoLimite: number | string;
// }

// export interface IProva {
//   id: string | number | null;
//   titulo: string;
//   duracao: string;
//   pontos: number;
//   materia: string;
//   instrucoes: string;
//   questoes: AnyQuestion[];
//   configuracoes: IProvaConfiguracoes;
// }

// export type TQuestionType = AnyQuestion["tipo"];
