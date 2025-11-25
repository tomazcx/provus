import { AvaliadorQuestaoDetalheApiResponse } from "./AvaliadorQuestaoDetalhe.response";
import { EstadoSubmissaoEnum } from "../../../enums/EstadoSubmissaoEnum";

interface SubmissaoResponseSimplificada {
  id: number;
  aplicacao_id: number;
  codigoEntrega: number;
  hash: string;
  estado: EstadoSubmissaoEnum;
  pontuacaoTotal: number | null;
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm: string | null;
}

interface EstudanteSubmissaoDetalheApiResponse {
  nome: string;
  email: string;
}

export interface AvaliadorSubmissaoDetalheApiResponse {
  submissao: SubmissaoResponseSimplificada;
  estudante: EstudanteSubmissaoDetalheApiResponse;
  questoes: AvaliadorQuestaoDetalheApiResponse[];
  tituloAvaliacao: string | null;
  pontuacaoTotalAvaliacao: number;
}
