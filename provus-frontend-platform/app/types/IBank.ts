import type { IQuestao } from "./IQuestao";

export interface ItemSistemaDeArquivos {
  id?: number;
  titulo: string;
  path?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface IFolder extends ItemSistemaDeArquivos {
  filhos: IFolder[] | IQuestao[];
}
