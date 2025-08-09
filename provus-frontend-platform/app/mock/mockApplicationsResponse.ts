import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type { IAplicacao } from "~/types/IAplicacao";

export const mockApplicationsResponse: IAplicacao[] = [
  {
    id: 1,
    titulo: "Mathematics Quiz - Chapter 1",
    descricao: "Uma avaliação sobre o período colonial e o império no Brasil.",
    dataAplicacao: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    participantes: 3,
    mediaGeral: 38.3,
    taxaDeConclusao: 66.7,
    tempoMedio: 20,
    maiorNota: 19,
    menorNota: 0,
    desvioPadrao: 8.2,
    notaMedia: 7.6,
    ajusteDeTempoEmSegundos: 0,
    estado: EstadoAplicacaoEnum.EM_ANDAMENTO, 
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
