import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type TipoItemEnum from "~/enums/TipoItemEnum";

export interface AlternativaApiResponse {
  id: number;
  descricao: string;
  isCorreto: boolean;
}

export interface QuestaoApiResponse {
  id: number;
  titulo: string;
  tipo: TipoItemEnum.QUESTAO;
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
