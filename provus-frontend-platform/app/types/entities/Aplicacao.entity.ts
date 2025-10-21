import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { AvaliacaoEntity } from "./Avaliacao.entity";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
export interface AplicacaoStatsEntity {
  totalSubmissoes: number;
  submissoesFinalizadas: number;
  taxaDeConclusaoPercentual: number;
  mediaGeralPercentual: number | null;
  maiorNotaPercentual: number | null;
  menorNotaPercentual: number | null;
  tempoMedioMinutos: number | null;
  pontuacaoTotalAvaliacao: number;
  finalScores?: number[];
}
export interface AplicacaoViolationEntity {
  id: number;
  estudanteNome: string;
  estudanteEmail: string;
  tipoInfracao: TipoInfracaoEnum;
  timestamp: string;
}

export interface AplicacaoEntity {
  id: number;
  codigoAcesso: string;
  estado: EstadoAplicacaoEnum;
  dataInicio: Date;
  dataFim: Date;
  avaliacao: AvaliacaoEntity;
  stats?: AplicacaoStatsEntity;
  violations?: AplicacaoViolationEntity[];
  totalSubmissoes: number;
  mediaGeralPercentual: number | null;
}
