import type { AvaliadorQuestaoDetalheApiResponse } from "./AvaliadorQuestaoDetalhe.response";
import type { SubmissaoResponse } from "./Submissao.response";

interface EstudanteSubmissaoDetalheApiResponse {
  nome: string;
  email: string;
}

export interface AvaliadorSubmissaoDetalheApiResponse {
  submissao: SubmissaoResponse;
  estudante: EstudanteSubmissaoDetalheApiResponse;
  questoes: AvaliadorQuestaoDetalheApiResponse[];
  tituloAvaliacao: string | null;
  pontuacaoTotalAvaliacao: number;
}
