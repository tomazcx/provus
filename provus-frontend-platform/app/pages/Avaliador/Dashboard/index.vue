<script setup lang="ts">
import StatsSection from "~/components/Home/StatsSection/index.vue";
import SchedulesSection from "~/components/Home/SchedulesSection/index.vue";
import FiltersSection from "~/components/Home/FiltersSection/index.vue";
import ExamsGrid from "~/components/Home/ExamsGrid/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

const applicationsStore = useApplicationsStore();

const filters = reactive({
  search: "",
  status: "Todos",
  sortBy: "Mais Recente",
});

onMounted(() => {
  applicationsStore.fetchApplications();
});

const filteredApplications = computed(() => {
  let result = [...applicationsStore.applications];

  if (filters.search) {
    const lowerSearch = filters.search.toLowerCase();
    result = result.filter(
      (app) =>
        app.avaliacao.titulo.toLowerCase().includes(lowerSearch) ||
        (app.avaliacao.descricao &&
          app.avaliacao.descricao.toLowerCase().includes(lowerSearch))
    );
  }

  if (filters.status !== "Todos") {
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
    switch (filters.sortBy) {
      case "Mais Recente":
        return b.dataInicio.getTime() - a.dataInicio.getTime();
      case "Mais Antigo":
        return a.dataInicio.getTime() - b.dataInicio.getTime();
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
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
      <div>
        <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Bem-vindo de volta! Aqui está um resumo de suas avaliações.
        </p>
      </div>
      <NuxtLink
        to="/avaliacao/editor"
        class="mt-4 sm:mt-0 bg-secondary hover:bg-secondary-dark cursor-pointer text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
      >
        <Icon name="i-lucide-plus" class="mr-2" />
        Criar Nova Avaliação
      </NuxtLink>
    </div>

    <StatsSection />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1 space-y-8 order-2 lg:order-1">
        <SchedulesSection />
      </div>

      <div class="lg:col-span-2 order-1 lg:order-2">
        <FiltersSection
          v-model:search="filters.search"
          v-model:status="filters.status"
          v-model:sort-by="filters.sortBy"
        />
        <ExamsGrid
          :applications="filteredApplications"
          :is-loading="applicationsStore.isLoading"
        />
      </div>
    </div>
  </div>
</template>
