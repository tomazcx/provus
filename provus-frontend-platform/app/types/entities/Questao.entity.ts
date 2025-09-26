import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { ItemEntity } from "./Item.entity";
import type TipoItemEnum from "~/enums/TipoItemEnum";

export interface AlternativaEntity {
  id?: number;
  descricao: string;
  isCorreto: boolean;
}

export interface QuestaoEntity extends ItemEntity {
  tipo: TipoItemEnum.QUESTAO;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  descricao?: string;
  pontuacao: number;
  isModelo: boolean;
  alternativas: AlternativaEntity[];
  exemploRespostaIa?: string;
  textoRevisao?: string;
}
