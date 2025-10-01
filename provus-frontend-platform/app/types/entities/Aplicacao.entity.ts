import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AvaliacaoEntity } from "./Avaliacao.entity";

export interface AplicacaoEntity {
  id: number;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: Date; 
  dataFim: Date; 
  avaliacao: AvaliacaoEntity;
}