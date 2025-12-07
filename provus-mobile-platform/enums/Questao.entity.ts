import { DificuldadeQuestaoEnum } from "./DificuldadeQuestaoEnum";
import { TipoQuestaoEnum } from "./TipoQuestaoEnum";

export interface QuestaoEntity {
  id: number;
  titulo: string;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  pontuacao: number;
}
