import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

export interface CreateAplicacaoRequest {
  avaliacaoId: number;
  estado: EstadoAplicacaoEnum;
}

export interface UpdateAplicacaoRequest {
  estado: EstadoAplicacaoEnum;
}
