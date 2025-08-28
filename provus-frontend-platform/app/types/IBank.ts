import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoItemEnum from "~/enums/TipoItemEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { IAlternativa } from "./IQuestao";
export interface IListItem {
  id: number;
  titulo: string;
  tipo: TipoItemEnum;
  criadoEm: string;
  atualizadoEm: string;
  paiId: number | null;
  path?: string;
}

export interface IFolderListItem extends IListItem {
  tipo: TipoItemEnum.PASTA;
}

export interface IQuestaoListItem extends IListItem {
  tipo: TipoItemEnum.QUESTAO;
  path: string;

  criadoEm: string;
  atualizadoEm: string;
  descricao?: string;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
  isModelo: boolean;
  tipoQuestao: TipoQuestaoEnum;
  textoRevisao?: string;
  alternativas: IAlternativa[];
  exemploRespostaIa?: string;
}

export type TBankItem = IFolderListItem | IQuestaoListItem;
