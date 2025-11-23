import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

export interface CreateAplicacaoRequest {
  avaliacaoId: number;
  estado: EstadoAplicacaoEnum;
  dataInicio?: string;
}

export interface UpdateAplicacaoRequest {
  estado: EstadoAplicacaoEnum;
}
