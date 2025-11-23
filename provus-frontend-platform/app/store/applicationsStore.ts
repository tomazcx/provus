import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { AplicacaoApiResponse } from "~/types/api/response/Aplicacao.response";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type {
  CreateAplicacaoRequest,
  UpdateAplicacaoRequest,
} from "~/types/api/request/Aplicacao.request";
import { mapAvaliacaoApiResponseToEntity } from "~/mappers/assessment.mapper";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";

export function mapAplicacaoApiResponseToEntity(
  apiResponse: AplicacaoApiResponse
): AplicacaoEntity {
  return {
    id: apiResponse.id,
    codigoAcesso: apiResponse.codigoAcesso,
    estado: apiResponse.estado,
    dataInicio: new Date(apiResponse.dataInicio),
    dataFim: new Date(apiResponse.dataFim),
    avaliacao: mapAvaliacaoApiResponseToEntity(apiResponse.avaliacao),
    stats: apiResponse.stats ? { ...apiResponse.stats } : undefined,
    violations: apiResponse.violations
      ? [...apiResponse.violations]
      : undefined,
    totalSubmissoes: apiResponse.totalSubmissoes,
    mediaGeralPercentual: apiResponse.mediaGeralPercentual,
  };
}

interface EstadoAplicacaoPayload {
  aplicacaoId: number;
  novoEstado: EstadoAplicacaoEnum;
  novaDataFimISO: string;
}

export const useApplicationsStore = defineStore("applications", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();
  const applications = ref<AplicacaoEntity[]>([]);
  const isLoading = ref(false);

  const nuxtApp = useNuxtApp();
  const getWebsocket = () =>
    nuxtApp.$websocket as ReturnType<typeof useWebSocket> | undefined;

  const listenersInitialized = ref(false);

  const dashboardStats = computed(() => {
    const total = applications.value.length;
    const emAndamento = applications.value.filter(
      (app) => app.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
    ).length;
    const concluidas = applications.value.filter(
      (app) =>
        app.estado === EstadoAplicacaoEnum.CONCLUIDA ||
        app.estado === EstadoAplicacaoEnum.FINALIZADA
    ).length;
    const agendadas = applications.value.filter(
      (app) => app.estado === EstadoAplicacaoEnum.AGENDADA
    ).length;

    return {
      total,
      emAndamento,
      concluidas,
      agendadas,
    };
  });

  const upcomingSchedules = computed(() => {
    return applications.value
      .filter((app) => app.estado === EstadoAplicacaoEnum.AGENDADA)
      .sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())
      .slice(0, 5);
  });

  function onEstadoAtualizado(data: EstadoAplicacaoPayload) {
    console.log(
      `[ApplicationsStore] 🔔 Evento WS recebido: ${data.novoEstado} para App ${data.aplicacaoId}`
    );
    updateApplicationData(data.aplicacaoId, {
      estado: data.novoEstado,
      dataFim: new Date(data.novaDataFimISO),
    });
  }

  function initializeWebSocketListeners() {
    const ws = getWebsocket();
    if (!ws || !ws.socket.value) {
      console.warn(
        "[ApplicationsStore] Tentativa de iniciar listeners falhou: Socket não disponível."
      );
      return;
    }

    if (listenersInitialized.value) {
      ws.socket.value.off("estado-aplicacao-atualizado", onEstadoAtualizado);
    }

    ws.on<EstadoAplicacaoPayload>(
      "estado-aplicacao-atualizado",
      onEstadoAtualizado
    );
    listenersInitialized.value = true;
    console.log(
      "[ApplicationsStore] ✅ Listeners WebSocket conectados e ouvindo 'estado-aplicacao-atualizado'."
    );
  }

  async function fetchApplications() {
    isLoading.value = true;
    try {
      const response = await $api<AplicacaoApiResponse[]>(
        "/backoffice/aplicacoes"
      );
      if (!Array.isArray(response)) {
        applications.value = [];
        return;
      }
      applications.value = response.map(mapAplicacaoApiResponseToEntity);

      const ws = getWebsocket();
      if (ws?.isConnected.value) {
        initializeWebSocketListeners();
      }
    } catch (e) {
      console.error(e);
      toast.add({
        title: "Erro ao buscar aplicações",
        description: "Erro de conexão",
        color: "error",
      });
    } finally {
      isLoading.value = false;
    }
  }

  const ws = getWebsocket();
  if (ws) {
    watch(
      ws.isConnected,
      (connected) => {
        console.log(
          `[ApplicationsStore] Status de conexão alterado: ${connected}`
        );
        if (connected) {
          initializeWebSocketListeners();
        } else {
          listenersInitialized.value = false;
          console.log(
            "[ApplicationsStore] Listeners marcados como desconectados."
          );
        }
      },
      { immediate: true }
    );
  }

  function getApplicationById(id: number) {
    return applications.value.find((app) => app.id === id);
  }

  async function createApplication(
    modelo: AvaliacaoEntity
  ): Promise<AplicacaoEntity | null> {
    try {
      const configGerais = modelo.configuracao.configuracoesGerais;
      const isAgendada =
        configGerais.tipoAplicacao === TipoAplicacaoEnum.AGENDADA &&
        configGerais.dataAgendamento;

      const payload: CreateAplicacaoRequest = {
        avaliacaoId: modelo.id,
        estado: isAgendada
          ? EstadoAplicacaoEnum.AGENDADA
          : EstadoAplicacaoEnum.CRIADA,
        dataInicio:
          isAgendada && configGerais.dataAgendamento
            ? configGerais.dataAgendamento.toISOString()
            : undefined,
      };

      const newApplicationResponse = await $api<AplicacaoApiResponse>(
        "/backoffice/aplicacao",
        {
          method: "POST",
          body: payload,
        }
      );
      await fetchApplications();
      return mapAplicacaoApiResponseToEntity(newApplicationResponse);
    } catch {
      const errorMessage = "Ocorreu um erro desconhecido.";
      toast.add({
        title: "Erro ao criar aplicação",
        description: errorMessage,
        color: "error",
      });
      return null;
    }
  }

  async function updateApplicationStatus(
    applicationId: number,
    newStatus: EstadoAplicacaoEnum
  ) {
    try {
      const payload: UpdateAplicacaoRequest = { estado: newStatus };
      const updatedResponse = await $api<AplicacaoApiResponse>(
        `/backoffice/aplicacao/${applicationId}`,
        {
          method: "PUT",
          body: payload,
        }
      );
      const updatedEntity = mapAplicacaoApiResponseToEntity(updatedResponse);

      const index = applications.value.findIndex((a) => a.id === applicationId);
      if (index !== -1) {
        applications.value.splice(index, 1, updatedEntity);
      }

      toast.add({
        title: "Status da aplicação atualizado!",
        color: "secondary",
      });
    } catch {
      const errorMessage = "Ocorreu um erro desconhecido.";
      toast.add({
        title: "Erro ao atualizar status",
        description: errorMessage,
        color: "error",
      });
    }
  }

  function updateApplicationData(
    applicationId: number,
    updatedFields: Partial<Pick<AplicacaoEntity, "estado" | "dataFim">>
  ) {
    const appIndex = applications.value.findIndex(
      (a) => a.id === applicationId
    );

    if (appIndex !== -1) {
      const currentApp = applications.value[appIndex];

      if (!currentApp) return;

      const updatedApp: AplicacaoEntity = {
        ...currentApp,
        estado: updatedFields.estado ?? currentApp.estado,
        dataFim: updatedFields.dataFim
          ? new Date(updatedFields.dataFim)
          : currentApp.dataFim,
      };

      applications.value.splice(appIndex, 1, updatedApp);
      console.log(
        `[ApplicationsStore] Aplicação ${applicationId} atualizada localmente para ${updatedApp.estado}`
      );
    } else {
      console.warn(
        `[ApplicationsStore] Aplicação ${applicationId} não encontrada para atualização.`
      );
    }
  }

  async function deleteApplication(applicationId: number) {
    try {
      await $api(`/backoffice/aplicacao/${applicationId}`, {
        method: "DELETE",
      });
      applications.value = applications.value.filter(
        (a) => a.id !== applicationId
      );
      toast.add({
        title: "Aplicação deletada com sucesso!",
        color: "secondary",
      });
    } catch {
      const errorMessage = "Ocorreu um erro desconhecido.";
      toast.add({
        title: "Erro ao deletar aplicação",
        description: errorMessage,
        color: "error",
      });
    }
  }

  return {
    applications,
    isLoading,
    dashboardStats,
    upcomingSchedules,
    fetchApplications,
    getApplicationById,
    createApplication,
    updateApplicationStatus,
    updateApplicationData,
    deleteApplication,
  };
});
