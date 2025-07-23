import type { AnyQuestion } from "./Avaliacao";

export interface IFolder {
  type: "folder";
  id: string;
  titulo: string;
  contagem: number;
  modificadoEm: string;
}

export interface IQuestionListItem {
  type: "question";
  data: AnyQuestion;
}

export type TBankItem = IFolder | IQuestionListItem;
