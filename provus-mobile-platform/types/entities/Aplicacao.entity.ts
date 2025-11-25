import { EstadoAplicacaoEnum } from "../../enums/EstadoAplicacaoEnum";
import { TipoInfracaoEnum } from "../../enums/TipoInfracaoEnum";
import { AvaliacaoEntity } from "./Avaliacao.entity";

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
