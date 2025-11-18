<script setup lang="ts">
import ControlsSection from "~/components/Aplicacoes/ControlsSection/index.vue";
import ApplicationsGrid from "~/components/Aplicacoes/ApplicationsGrid/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

const applicationsStore = useApplicationsStore();

const filters = reactive({
  search: "",
  status: "Todos",
  sortBy: "Última Modificação",
});

onMounted(() => {
  applicationsStore.fetchApplications();
});

const allApplications = computed(() => applicationsStore.applications || []);

const filteredApplications = computed(() => {
  let result = [...allApplications.value];

  if (filters.search && filters.search.trim() !== "") {
    const lowerSearch = filters.search.toLowerCase();
    result = result.filter((app) =>
      app.avaliacao.titulo.toLowerCase().includes(lowerSearch)
    );
  }

  if (filters.status && filters.status !== "Todos") {
    const statusMap: Record<string, EstadoAplicacaoEnum> = {
      "Em Andamento": EstadoAplicacaoEnum.EM_ANDAMENTO,
      Agendada: EstadoAplicacaoEnum.AGENDADA,
      Concluída: EstadoAplicacaoEnum.CONCLUIDA,
      Finalizada: EstadoAplicacaoEnum.FINALIZADA,
      Pausada: EstadoAplicacaoEnum.PAUSADA,
      Cancelada: EstadoAplicacaoEnum.CANCELADA,
      Criada: EstadoAplicacaoEnum.CRIADA,
    };
    const targetStatus = statusMap[filters.status];
    if (targetStatus) {
      result = result.filter((app) => app.estado === targetStatus);
    }
  }

  result.sort((a, b) => {
    const dateA = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
    const dateB = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;

    switch (filters.sortBy) {
      case "Última Modificação":
        return dateB - dateA;
      case "Mais Recente":
        return dateB - dateA;
      case "Mais Antigo":
        return dateA - dateB;
      case "Título A-Z":
        return a.avaliacao.titulo.localeCompare(b.avaliacao.titulo);
      case "Título Z-A":
        return b.avaliacao.titulo.localeCompare(a.avaliacao.titulo);
      default:
        return 0;
    }
  });

  return result;
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-primary mb-1">
        Aplicações de Avaliações
      </h1>
      <p class="text-gray-600">
        Visualize e gerencie as avaliações aplicadas e seus resultados.
      </p>
    </div>

    <ControlsSection
      v-model:search="filters.search"
      v-model:status="filters.status"
      v-model:sort-by="filters.sortBy"
    />

    <ApplicationsGrid
      :applications="filteredApplications"
      :is-loading="applicationsStore.isLoading"
    />
  </div>
</template>
