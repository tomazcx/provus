import EstadoAvaliacaoEnum from "~/enums/EstadoAvaliacaoEnum";
import type { IAvaliacao } from "~/types/IAvaliacao";

export const mockDashboardResponse: {
  totalAvaliacoes: number;
  avaliacoesEmAndamento: number;
  avaliacoesFinalizadas: number;
  proximosAgendamentos: IAvaliacao[];
  ultimosEventos: IAvaliacao[];
} = {
  totalAvaliacoes: 12,
  avaliacoesEmAndamento: 5,
  avaliacoesFinalizadas: 3,
  proximosAgendamentos: [
    {
      id: 1,
      titulo: "Prova de Português",
      dataAgendamento: "2025-10-15T10:00:00Z",
      estado: EstadoAvaliacaoEnum.AGENDADA,
    },
    {
      id: 2,
      titulo: "Prova de História",
      dataAgendamento: "2025-10-16T14:00:00Z",
      estado: EstadoAvaliacaoEnum.AGENDADA,
    },
    {
      id: 3,
      titulo: "Prova de Ciências",
      dataAgendamento: "2025-10-17T09:00:00Z",
      estado: EstadoAvaliacaoEnum.AGENDADA,
    },
  ],
  ultimosEventos: [
    {
      id: 4,
      estado: EstadoAvaliacaoEnum.FINALIZADA,
      titulo: "Prova de Português",
      descricao: "Verbos, pronomes, etc.",
      atualizadoEm: "2023-10-14T08:00:00Z",
    },
    {
      id: 5,
      estado: EstadoAvaliacaoEnum.EM_ANDAMENTO,
      titulo: "Prova de física",
      descricao: "Leis de Newton, movimento, etc.",
      atualizadoEm: "2025-10-14T08:00:00Z",
    },
    {
      id: 6,
      estado: EstadoAvaliacaoEnum.AGENDADA,
      titulo: "Prova de quimica",
      descricao: "Atômica, ligações químicas, etc.",
      atualizadoEm: "2025-10-14T08:00:00Z",
    },
  ],
};
