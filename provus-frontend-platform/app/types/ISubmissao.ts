import type EstadoSubmissaoEnum from "@/enums/EstadoSubmissaoEnum";

export interface ISubmissao {
  id: number;
  iniciadoEm?: string;
  finalizadoEm?: string;
  pontuacaoTotal?: number;
  avaliacaoId: number;
  estudanteId: number;
  estado: EstadoSubmissaoEnum;
  criadoEm?: string;
  atualizadoEm?: string;
}
