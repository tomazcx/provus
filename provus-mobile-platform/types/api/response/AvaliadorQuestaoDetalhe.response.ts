import { DificuldadeQuestaoEnum } from "../../../enums/DificuldadeQuestaoEnum";
import { AvaliadorAlternativaDetalheApiResponse } from "./AvaliadorAlternativaDetalhe.response";
import { TipoQuestaoEnum } from "../../../enums/TipoQuestaoEnum";

export enum EstadoQuestaoCorrigida {
  CORRETA = "Correta",
  INCORRETA = "Incorreta",
  PARCIALMENTE_CORRETA = "Parcialmente Correta",
  NAO_RESPONDIDA = "Não Respondida",
}

export type DadosResposta =
  | { texto: string }
  | { alternativa_id: number | null }
  | { alternativas_id: number[] }
  | null
  | Record<string, never>;

export interface AvaliadorQuestaoDetalheApiResponse {
  id: number;
  titulo: string;
  descricao: string | null;
  pontuacaoMaxima: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipo: TipoQuestaoEnum; 
  alternativas: AvaliadorAlternativaDetalheApiResponse[];
  dadosResposta: DadosResposta | null;
  pontuacaoObtida: number | null;
  estadoCorrecao: EstadoQuestaoCorrigida | null;
  textoRevisao: string | null;
  exemploRespostaIa: string | null;
}
