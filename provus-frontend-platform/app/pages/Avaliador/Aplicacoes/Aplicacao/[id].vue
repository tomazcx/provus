<script setup lang="ts">
import Header from "@/components/Aplicacoes/AplicacoesHeader/index.vue";
// import OverviewStats from "@/components/Aplicacoes/Detalhes/OverviewStats.vue";
// import AnalysisGrid from "@/components/Aplicacoes/Detalhes/AnalysisGrid.vue";
// import ViolationsTable from "@/components/Aplicacoes/Detalhes/ViolationsTable.vue";
// import Breadcrumbs from "@/components/Breadcrumbs/index.vue";

import { useApplicationsStore } from "~/store/applicationsStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";

const applicationsStore = useApplicationsStore();
const route = useRoute();

const aplicacao = ref<AplicacaoEntity | null>(null);
const modeloDaAplicacao = ref<AvaliacaoEntity | null>(null);

watchEffect(() => {
  if (applicationsStore.applications.length > 0) {
    const applicationId = parseInt(route.params.id as string, 10);
    const foundApplication =
      applicationsStore.getApplicationById(applicationId);

    if (foundApplication) {
      aplicacao.value = foundApplication;
      modeloDaAplicacao.value = foundApplication.avaliacao;
    } else {
      console.error("Aplicação não encontrada!");
    }
  }
});

onMounted(() => {
  if (applicationsStore.applications.length === 0) {
    applicationsStore.fetchApplications();
  }
});
</script>

<template>
  <div v-if="aplicacao && modeloDaAplicacao">
    <!-- <Breadcrumbs :aplicacao="aplicacao" level="details" /> -->

    <Header
      :titulo="modeloDaAplicacao.titulo"
      :descricao="modeloDaAplicacao.descricao"
      :data-aplicacao="aplicacao.dataInicio.toISOString()"
    />

    <div class="bg-green-100 border border-green-200 rounded-lg px-4 py-3 mb-8">
      <div class="flex items-center space-x-2">
        <Icon name="i-lucide-check-circle" class="text-green-600" />
        <span class="font-medium text-green-800">{{ aplicacao.estado }}</span>
        <UTooltip text="Disponível após a finalização da aplicação">
          <span class="text-green-600">• -- participantes</span>
        </UTooltip>
      </div>
    </div>

    <!-- <OverviewStats :aplicacao="aplicacao" /> -->
    <!-- <AnalysisGrid :aplicacao="aplicacao" :modelo="modeloDaAplicacao" /> -->
    <!-- <ViolationsTable :aplicacao="aplicacao" /> -->
  </div>
  <div v-else>
    <p class="text-gray-500">Carregando dados da aplicação...</p>
  </div>
</template>
