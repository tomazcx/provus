import { EstadoAplicacaoEnum } from "../../../enums/EstadoAplicacaoEnum";
import {
  AplicacaoStatsEntity,
  AplicacaoViolationEntity,
} from "../../entities/Aplicacao.entity";
import { AvaliacaoApiResponse } from "./Avaliacao.response";

export interface AplicacaoApiResponse {
  id: number;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: string;
  dataFim: string; 
  avaliacao: AvaliacaoApiResponse;
  stats?: AplicacaoStatsEntity;
  violations?: AplicacaoViolationEntity[];
  totalSubmissoes: number;
  mediaGeralPercentual: number | null;
}
