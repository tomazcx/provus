<script setup lang="ts">
import ApplicationCard from "~/components/Aplicacoes/ApplicationCard/index.vue";
import ViewConfigurationDialog from "~/components/Aplicacoes/Detalhes/ViewConfigurationDialog.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

const applicationsStore = useApplicationsStore();
const examBankStore = useExamBankStore();

const applications = computed(() => applicationsStore.applications);

const isConfigDialogOpen = ref(false);
const modeloParaVisualizar = ref<IAvaliacaoImpl | null>(null);

onMounted(() => {
  applicationsStore.fetchItems();
  examBankStore.fetchItems();
});

function handleViewConfig(aplicacao: IAplicacao) {
  const foundModelo = examBankStore.getItemById(aplicacao.avaliacaoModeloId);
  if (foundModelo) {
    modeloParaVisualizar.value = foundModelo;
    isConfigDialogOpen.value = true;
  } else {
    console.error("Modelo da aplicação não encontrado!");
  }
}
</script>

<template>
  <div>
    <ViewConfigurationDialog
      v-model="isConfigDialogOpen"
      :configuracao="modeloParaVisualizar"
    />

    <div v-if="applicationsStore.isLoading" class="text-center text-gray-500">
      <Icon name="i-lucide-loader-2" class="animate-spin h-8 w-8" />
      <p>Carregando aplicações...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ApplicationCard
        v-for="app in applications"
        :key="app.id"
        :item="app"
        @view-config="handleViewConfig"
      />
    </div>
  </div>
</template>
