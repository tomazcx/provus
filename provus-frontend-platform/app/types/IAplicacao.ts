import type EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";

export type Penalidade = {
  estudante: string;
  email: string;
  infracao: TipoInfracaoEnum;
  penalidade: TipoPenalidadeEnum;
  hora: string;
};

export interface IAplicacao {
  id: number;
  titulo: string;
  descricao?: string;
  dataAplicacao: string;
  participantes: number;
  taxaDeConclusao: number;
  tempoMedio: number;
  mediaGeral: number;
  maiorNota: number;
  menorNota: number;
  desvioPadrao: number;
  notaMedia: number;
  penalidades: Penalidade[];
  estado: EstadoAplicacaoEnum;
  avaliacaoModeloId: number;
}
