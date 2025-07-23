export type TDifficulty = "Fácil" | "Médio" | "Difícil";

interface IQuestionBase {
  id: number;
  titulo: string;
  materia?: string;
  pontuacao?: number;
  dificuldade?: TDifficulty;
  explicacao?: string;
  descricao?: string;
  isModelo?: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
  textoRevisao?: string;
}

export interface IQuestionAlternative {
  id: number;
  texto: string;
  isCorreta: boolean;
}

export interface IQuestionObjective extends IQuestionBase {
  tipo: { label: "Objetiva"; value: "objective" };
  opcoes: IQuestionAlternative[];
}

export interface IQuestionMultipleChoice extends IQuestionBase {
  tipo: { label: "Múltipla Escolha"; value: "multipla-escolha" };
  opcoes: IQuestionAlternative[];
}

export interface IQuestionTrueOrFalse extends IQuestionBase {
  tipo: { label: "Verdadeiro ou Falso"; value: "verdadeiro-falso" };
  opcoes: IQuestionAlternative[];
}

export interface IQuestionDiscursive extends IQuestionBase {
  tipo: { label: "Discursiva"; value: "discursiva" };
  modeloDeResposta?: string;
}

export type AnyQuestion =
  | IQuestionMultipleChoice
  | IQuestionTrueOrFalse
  | IQuestionObjective
  | IQuestionDiscursive;

export interface IProvaConfiguracoes {
  embaralharQuestoes: boolean;
  mostrarResultados: boolean;
  permitirRefazer: boolean;
  tentativasPermitidas: number | string;
  correcaoIA: boolean;
  tempoLimite: number | string;
}

export interface IProva {
  id: string | number | null;
  titulo: string;
  duracao: string;
  pontos: number;
  materia: string;
  instrucoes: string;
  questoes: AnyQuestion[];
  configuracoes: IProvaConfiguracoes;
}

export type TQuestionType = AnyQuestion["tipo"];
