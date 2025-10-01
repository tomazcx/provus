import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AvaliacaoApiResponse } from "./Avaliacao.response";

export interface AplicacaoApiResponse {
  id: number;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: string;
  dataFim: string;
  avaliacao: AvaliacaoApiResponse;
}
