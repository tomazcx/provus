import { EstadoSubmissaoEnum } from "../../../enums/EstadoSubmissaoEnum";

export interface SubmissaoNaListaResponse {
  id: number;
  aplicacao_id: number;
  codigoEntrega: number;
  hash: string;
  estado: EstadoSubmissaoEnum;
  pontuacaoTotal: number | null;
  criadoEm: string;
  atualizadoEm: string;
  finalizadoEm: string | null;
  estudante: {
    nome: string;
    email: string;
  };
  iniciadoEm: string;
}

export interface FindSubmissoesResponse {
  applicationId: number;
  avaliacaoId: number;
  titulo: string;
  descricao?: string;
  pontuacaoTotal: number;
  dataAplicacao: string;
  submissoes: SubmissaoNaListaResponse[];
}
