import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

export const useApplicationsStore = defineStore("applications", () => {
  const applications = ref<IAplicacao[]>([]);
  const isLoading = ref(false);

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

  function createApplication(modelo: IAvaliacaoImpl) {
    const isAgendada =
      modelo.configuracoes.tipoAplicacao === TipoAplicacaoEnum.AGENDADA &&
      modelo.configuracoes.dataAgendada &&
      new Date(modelo.configuracoes.dataAgendada) > new Date();

    const newApplication: IAplicacao = {
      id: Date.now(),
      titulo: modelo.titulo,
      descricao: modelo.descricao,
      dataAplicacao: isAgendada
        ? new Date(modelo.configuracoes.dataAgendada!).toISOString()
        : new Date().toISOString(),
      estado: isAgendada
        ? EstadoAplicacaoEnum.AGENDADA
        : EstadoAplicacaoEnum.EM_ANDAMENTO,
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
    };

    applications.value.unshift(newApplication);
  }

  return {
    applications,
    isLoading,
    fetchItems,
    getApplicationById,
    createApplication,
  };
});
