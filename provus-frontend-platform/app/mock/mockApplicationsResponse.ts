import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type { IAplicacao } from "~/types/IAplicacao";

export const mockApplicationsResponse: IAplicacao[] = [
  {
    id: 1,
    titulo: "Mathematics Quiz - Chapter 1",
    dataAplicacao: "2024-03-15T00:00:00Z",
    participantes: 32,
    mediaGeral: 84.5,
    taxaDeConclusao: 0.75,
    tempoMedio: 15,
    maiorNota: 9.8,
    menorNota: 4.5,
    desvioPadrao: 0.15,
    notaMedia: 8.45,
    estado: EstadoAplicacaoEnum.CONCLUIDA,
    penalidades: [
      {
        estudante: "Fulano de tal",
        email: "fulano@gmail.com",
        infracao: TipoInfracaoEnum.COPIAR_COLAR,
        penalidade: TipoPenalidadeEnum.REDUZIR_PONTOS,
        hora: "2024-03-15T10:30:00Z",
      },
    ],
    avaliacaoModeloId: 101,
  },
];
