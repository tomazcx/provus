import type DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import type TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import type { DadosResposta } from "./Submissao.response";
import type { AvaliadorAlternativaDetalheApiResponse } from "./AvaliadorAlternativaDetalhe.response";

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
