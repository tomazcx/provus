import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

interface AlternativaRequest {
  descricao: string;
  isCorreto: boolean;
}

export interface CreateAiQuestaoDto {
  assunto: string;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  quantidade: number;
}

export interface CreateQuestaoRequest {
  titulo: string;
  paiId?: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipoQuestao: TipoQuestaoEnum;
  isModelo: boolean;
  descricao?: string;
  exemploRespostaIa?: string;
  pontuacao?: number;
  textoRevisao?: string;
  alternativas?: AlternativaRequest[];
}

export type UpdateQuestaoRequest = Partial<CreateQuestaoRequest>;
