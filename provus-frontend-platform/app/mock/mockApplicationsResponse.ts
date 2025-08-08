import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type { IAplicacao } from "~/types/IAplicacao";

export const mockApplicationsResponse: IAplicacao[] = [
  {
    id: 1,
    titulo: "Mathematics Quiz - Chapter 1",
    descricao: "Uma avaliação sobre o período colonial e o império no Brasil.",
    dataAplicacao: "2024-03-15T00:00:00Z",
    participantes: 3,
    mediaGeral: 38.3,
    taxaDeConclusao: 66.7,
    tempoMedio: 20,
    maiorNota: 19,
    menorNota: 0,
    desvioPadrao: 8.2,
    notaMedia: 7.6,
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
