<script setup lang="ts">
import Header from "@/components/Aplicacoes/AplicacoesHeader/index.vue";
import OverviewStats from "@/components/Aplicacoes/Detalhes/OverviewStats.vue";
import AnalysisGrid from "@/components/Aplicacoes/Detalhes/AnalysisGrid.vue";
import ViolationsTable from "@/components/Aplicacoes/Detalhes/ViolationsTable.vue";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";

import { useApplicationsStore } from "~/store/applicationsStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

const applicationsStore = useApplicationsStore();
const examBankStore = useExamBankStore();
const route = useRoute();

const aplicacao = ref<IAplicacao | null>(null);
const modeloDaAplicacao = ref<IAvaliacaoImpl | null>(null);

onMounted(async () => {
  await applicationsStore.fetchItems();
  await examBankStore.fetchItems();

  const applicationId = parseInt(route.params.id as string, 10);
  const foundApplication = applicationsStore.getApplicationById(applicationId);

  if (foundApplication) {
    aplicacao.value = foundApplication;
    const foundModelo = examBankStore.getItemById(
      foundApplication.avaliacaoModeloId
    );
    if (foundModelo) {
      modeloDaAplicacao.value = foundModelo;
    }
  } else {
    console.error("Aplicação não encontrada!");
  }
});
</script>

<template>
  <div v-if="aplicacao && modeloDaAplicacao">
    <Breadcrumbs :aplicacao="aplicacao" level="details" />

    <Header
      :titulo="modeloDaAplicacao.titulo"
      :descricao="modeloDaAplicacao.descricao"
      :data-aplicacao="aplicacao.dataAplicacao"
    />

    <div class="bg-green-100 border border-green-200 rounded-lg px-4 py-3 mb-8">
      <div class="flex items-center space-x-2">
        <Icon name="i-lucide-check-circle" class="text-green-600" />
        <span class="font-medium text-green-800">{{ aplicacao.estado }}</span>
        <span class="text-green-600"
          >• {{ aplicacao.participantes }} participantes</span
        >
      </div>
    </div>

    <OverviewStats :aplicacao="aplicacao" />
    <AnalysisGrid :aplicacao="aplicacao" :modelo="modeloDaAplicacao" />
    <ViolationsTable :aplicacao="aplicacao" />
  </div>
  <div v-else>
    <p class="text-gray-500">Carregando dados da aplicação...</p>
  </div>
</template>
