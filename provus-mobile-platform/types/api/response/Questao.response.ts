import { DificuldadeQuestaoEnum } from "../../../enums/DificuldadeQuestaoEnum";
import { TipoQuestaoEnum } from "../../../enums/TipoQuestaoEnum";

export interface AlternativaApiResponse {
  id: number;
  descricao: string;
  isCorreto: boolean;
}

export interface QuestaoApiResponse {
  id: number;
  titulo: string;
  tipo: any;
  paiId: number | null;
  criadoEm: string;
  atualizadoEm: string;
  dificuldade: DificuldadeQuestaoEnum;
  descricao?: string;
  exemploRespostaIa?: string;
  isModelo: boolean;
  pontuacao: number;
  tipoQuestao: TipoQuestaoEnum;
  textoRevisao?: string;
  alternativas: AlternativaApiResponse[];
  path?: string;
}
