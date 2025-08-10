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
const applicationToStart = ref<IAplicacao | null>(null);
const isDialogVisible = computed({
  get: () => !!applicationToStart.value,
  set: (value) => {
    if (!value) {
      applicationToStart.value = null;
    }
  },
});
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

function handleApplyNow(aplicacao: IAplicacao) {
  applicationsStore.applyScheduledNow(aplicacao.id);
}

function handleCancelSchedule(aplicacao: IAplicacao) {
  applicationsStore.cancelScheduled(aplicacao.id);
}

function handleReopen(aplicacao: IAplicacao) {
  applicationsStore.reopenApplication(aplicacao.id);
}

function handleStartNowFromCard(aplicacao: IAplicacao) {
  applicationToStart.value = aplicacao;
}

function handleStartNowFromDialog() {
  if (applicationToStart.value) {
    applicationsStore.startApplication(applicationToStart.value.id);
    applicationToStart.value = null; // Fecha o diálogo
  }
}
</script>

<template>
  <div>
    <ViewConfigurationDialog
      v-model="isConfigDialogOpen"
      :configuracao="modeloParaVisualizar"
    />

    <StartApplicationDialog
      v-model="isDialogVisible"
      :aplicacao="applicationToStart"
      @start-now="handleStartNowFromDialog"
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
        @apply-now="handleApplyNow"
        @cancel-schedule="handleCancelSchedule"
        @reopen="handleReopen"
        @start-now="handleStartNowFromCard"
      />
    </div>
  </div>
</template>
