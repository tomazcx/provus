<script setup lang="ts">
import ApplicationCard from "~/components/Aplicacoes/ApplicationCard/index.vue";
import ViewConfigurationDialog from "~/components/Aplicacoes/Detalhes/ViewConfigurationDialog.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

const applicationsStore = useApplicationsStore();
const examBankStore = useExamBankStore();
const router = useRouter();

const applications = computed(() => applicationsStore.applications);
const applicationToStart = ref<AplicacaoEntity | null>(null);
const isDialogVisible = computed({
  get: () => !!applicationToStart.value,
  set: (value) => {
    if (!value) {
      applicationToStart.value = null;
    }
  },
});
const isConfigDialogOpen = ref(false);
const modeloParaVisualizar = ref<AvaliacaoEntity | null>(null);

onMounted(() => {
  applicationsStore.fetchApplications();
  examBankStore.initialize();
});

function handleViewConfig(aplicacao: AplicacaoEntity) {
  modeloParaVisualizar.value = aplicacao.avaliacao;
  isConfigDialogOpen.value = true;
}

function handleApplyNow(aplicacao: AplicacaoEntity) {
  applicationsStore.updateApplicationStatus(
    aplicacao.id,
    EstadoAplicacaoEnum.EM_ANDAMENTO
  );
}

function handleCancelSchedule(aplicacao: AplicacaoEntity) {
  applicationsStore.updateApplicationStatus(
    aplicacao.id,
    EstadoAplicacaoEnum.CANCELADA
  );
}

function handleReopen(aplicacao: AplicacaoEntity) {
  applicationsStore.updateApplicationStatus(
    aplicacao.id,
    EstadoAplicacaoEnum.CRIADA
  );
}

function handleStartNowFromCard(aplicacao: AplicacaoEntity) {
  applicationToStart.value = aplicacao;
}

function handleStartNowFromDialog() {
  if (applicationToStart.value) {
    const appId = applicationToStart.value.id;
    applicationsStore.updateApplicationStatus(
      appId,
      EstadoAplicacaoEnum.EM_ANDAMENTO
    );
    applicationToStart.value = null;
    router.push(`/aplicacoes/aplicacao/${appId}/monitoramento`);
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
