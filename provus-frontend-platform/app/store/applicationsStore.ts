import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const useApplicationsStore = defineStore("applications", () => {
  const applications = ref<IAplicacao[]>([]);
  const isLoading = ref(false);
  const toast = useToast();

  async function fetchItems() {
    if (applications.value.length > 0) return;

    isLoading.value = true;
    try {
      const { mockApplicationsResponse } = await import(
        "~/mock/mockApplicationsResponse"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      applications.value = mockApplicationsResponse;
    } catch (error) {
      console.error("Erro ao buscar aplicações:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function getApplicationById(id: number) {
    return applications.value.find((app) => app.id === id);
  }

  function createApplication(modelo: IAvaliacaoImpl): IAplicacao {
    const isAgendada =
      modelo.configuracoes.tipoAplicacao === TipoAplicacaoEnum.AGENDADA &&
      modelo.configuracoes.dataAgendada &&
      new Date(modelo.configuracoes.dataAgendada) > new Date();

    const newApplication: IAplicacao = {
      id: Date.now(),
      estado: isAgendada
        ? EstadoAplicacaoEnum.AGENDADA
        : EstadoAplicacaoEnum.CRIADA,
      codigoDeAcesso: generateAccessCode(),
      titulo: modelo.titulo,
      descricao: modelo.descricao,
      dataAplicacao: isAgendada
        ? new Date(modelo.configuracoes.dataAgendada!).toISOString()
        : new Date().toISOString(),
      participantes: 0,
      avaliacaoModeloId: modelo.id!,
      taxaDeConclusao: 0,
      tempoMedio: 0,
      mediaGeral: 0,
      maiorNota: 0,
      menorNota: 0,
      desvioPadrao: 0,
      notaMedia: 0,
      penalidades: [],
      ajusteDeTempoEmSegundos: 0,
    };

    applications.value.unshift(newApplication);
    return newApplication; 
  }

  function updateApplicationStatus(
    applicationId: number,
    newStatus: EstadoAplicacaoEnum
  ) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (app) {
      app.estado = newStatus;
      console.log(app.estado);
    }
  }

  function ajustarTempoAplicacao(applicationId: number, segundos: number) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (app) {
      if (!app.ajusteDeTempoEmSegundos) {
        app.ajusteDeTempoEmSegundos = 0;
      }
      app.ajusteDeTempoEmSegundos += segundos;

      toast.add({
        title: `Tempo da avaliação ajustado em ${segundos > 0 ? "+" : ""}${
          segundos / 60
        } minutos.`,
        icon: "i-lucide-timer",
      });
    }
  }

  function startApplication(applicationId: number) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (app && app.estado === EstadoAplicacaoEnum.CRIADA) {
      app.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
      app.dataAplicacao = new Date().toISOString();
      toast.add({
        title: "Avaliação iniciada!",
        description: "Os alunos já podem começar.",
        icon: "i-lucide-play-circle",
        color: "secondary",
      });
    }
  }

  function reiniciarTimerAplicacao(applicationId: number) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (app) {
      app.dataAplicacao = new Date().toISOString();
      app.ajusteDeTempoEmSegundos = 0;

      toast.add({
        title: "Timer da avaliação reiniciado!",
        icon: "i-lucide-rotate-cw",
      });
    }
  }

  function applyScheduledNow(applicationId: number) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (app && app.estado === EstadoAplicacaoEnum.AGENDADA) {
      app.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
      app.dataAplicacao = new Date().toISOString();
      toast.add({
        title: "Aplicação iniciada!",
        description: "A avaliação agora está em andamento.",
        icon: "i-lucide-play-circle",
        color: "secondary",
      });
    }
  }

  function cancelScheduled(applicationId: number) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (app && app.estado === EstadoAplicacaoEnum.AGENDADA) {
      app.estado = EstadoAplicacaoEnum.CANCELADA;
      toast.add({
        title: "Agendamento cancelado.",
        icon: "i-lucide-calendar-x-2",
        color: "error",
      });
    }
  }

  function reopenApplication(applicationId: number) {
    const app = applications.value.find((a) => a.id === applicationId);
    if (
      app &&
      (app.estado === EstadoAplicacaoEnum.CONCLUIDA ||
        app.estado === EstadoAplicacaoEnum.FINALIZADA)
    ) {
      app.estado = EstadoAplicacaoEnum.EM_ANDAMENTO;
      app.dataAplicacao = new Date().toISOString();
      app.ajusteDeTempoEmSegundos = 0;

      toast.add({
        title: "Aplicação reaberta!",
        description: "A avaliação está em andamento novamente.",
        icon: "i-lucide-refresh-cw",
        color: "primary",
      });
    }
  }

  return {
    applications,
    isLoading,
    fetchItems,
    getApplicationById,
    createApplication,
    updateApplicationStatus,
    ajustarTempoAplicacao,
    reiniciarTimerAplicacao,
    applyScheduledNow,
    cancelScheduled,
    reopenApplication,
    startApplication,
  };
});
