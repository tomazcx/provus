import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AvaliacaoApiResponse } from "./Avaliacao.response";
import type {
  AplicacaoStatsEntity,
  AplicacaoViolationEntity,
} from "~/types/entities/Aplicacao.entity";

export interface AplicacaoApiResponse {
  id: number;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: string;
  dataFim: string;
  avaliacao: AvaliacaoApiResponse;
  stats?: AplicacaoStatsEntity;
  violations?: AplicacaoViolationEntity[];
}
