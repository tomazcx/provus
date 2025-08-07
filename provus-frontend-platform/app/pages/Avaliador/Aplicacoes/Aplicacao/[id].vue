<script setup lang="ts">
import ApplicationHeader from "@/components/Aplicacoes/Detalhes/ApplicationHeader.vue";
import OverviewStats from "@/components/Aplicacoes/Detalhes/OverviewStats.vue";
import AnalysisGrid from "@/components/Aplicacoes/Detalhes/AnalysisGrid.vue";
import ViolationsTable from "@/components/Aplicacoes/Detalhes/ViolationsTable.vue";
import ViewConfigurationDialog from "~/components/Aplicacoes/Detalhes/ViewConfigurationDialog.vue";

import { useApplicationsStore } from "~/store/applicationsStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

const applicationsStore = useApplicationsStore();
const examBankStore = useExamBankStore();
const route = useRoute();

const isConfigDialogOpen = ref(false);
const aplicacao = ref<IAplicacao | null>(null);
const modeloDaAplicacao = ref<IAvaliacaoImpl | null>(null);

onMounted(async () => {
  console.log(examBankStore.items)
  await applicationsStore.fetchItems();
  await examBankStore.fetchItems();

  const applicationId = parseInt(route.params.id as string, 10);
  const foundApplication = applicationsStore.getApplicationById(applicationId);

  if (foundApplication) {
    aplicacao.value = foundApplication;

    const foundModelo = examBankStore.getItemById(
      foundApplication.avaliacaoModeloId
    );

    console.log(foundApplication);

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
    <ApplicationHeader :aplicacao="aplicacao" :modelo="modeloDaAplicacao" />
    <OverviewStats :aplicacao="aplicacao" />
    <AnalysisGrid
      :aplicacao="aplicacao"
      :modelo="modeloDaAplicacao"
      @view-config="isConfigDialogOpen = true"
    />
    <ViolationsTable :aplicacao="aplicacao" />

    <ViewConfigurationDialog
      v-model="isConfigDialogOpen"
      :configuracao="modeloDaAplicacao"
    />
  </div>
  <div v-else>
    <p class="text-gray-500">Carregando dados da aplicação...</p>
  </div>
</template>
