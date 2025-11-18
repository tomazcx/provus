import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { AplicacaoApiResponse } from "~/types/api/response/Aplicacao.response";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type {
  CreateAplicacaoRequest,
  UpdateAplicacaoRequest,
} from "~/types/api/request/Aplicacao.request";
import { mapAvaliacaoApiResponseToEntity } from "~/mappers/assessment.mapper";

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

export const useApplicationsStore = defineStore("applications", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const applications = ref<AplicacaoEntity[]>([]);
  const isLoading = ref(false);

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

  async function fetchApplications() {
    isLoading.value = true;
    try {
      const response = await $api<AplicacaoApiResponse[]>(
        "/backoffice/aplicacoes"
      );
      applications.value = response.map(mapAplicacaoApiResponseToEntity);
    } catch {
      toast.add({ title: "Erro ao buscar aplicações", color: "error" });
    } finally {
      isLoading.value = false;
    }
  }

  function getApplicationById(id: number) {
    return applications.value.find((app) => app.id === id);
  }

  async function createApplication(
    modelo: AvaliacaoEntity
  ): Promise<AplicacaoEntity | null> {
    try {
      const payload: CreateAplicacaoRequest = {
        avaliacaoId: modelo.id,
        estado: modelo.configuracao.configuracoesGerais.dataAgendamento
          ? EstadoAplicacaoEnum.AGENDADA
          : EstadoAplicacaoEnum.CRIADA,
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

  function updateApplicationData(
    applicationId: number,
    updatedFields: Partial<Pick<AplicacaoEntity, "estado" | "dataFim">>
  ) {
    const appIndex = applications.value.findIndex(
      (a) => a.id === applicationId
    );
    if (appIndex !== -1) {
      const appToUpdate = applications.value[appIndex]!;
      if (updatedFields.estado !== undefined) {
        appToUpdate.estado = updatedFields.estado;
      }
      if (updatedFields.dataFim !== undefined) {
        appToUpdate.dataFim = new Date(updatedFields.dataFim);
      }
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
      updateApplicationData(applicationId, {
        estado: updatedEntity.estado,
        dataFim: updatedEntity.dataFim,
      });

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
