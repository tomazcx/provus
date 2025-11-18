<script setup lang="ts">
import ApplicationCard from "~/components/Aplicacoes/ApplicationCard/index.vue";
import ViewConfigurationDialog from "~/components/Aplicacoes/Detalhes/ViewConfigurationDialog.vue";
import StartApplicationDialog from "~/components/Aplicacoes/StartApplicationDialog/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

withDefaults(
  defineProps<{
    applications?: AplicacaoEntity[];
    isLoading?: boolean;
  }>(),
  {
    applications: () => [],
    isLoading: false,
  }
);

const applicationsStore = useApplicationsStore();
const router = useRouter();

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

    <div v-if="isLoading" class="text-center text-gray-500 py-10">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-8 w-8 text-primary"
      />
      <p class="mt-2">Carregando aplicações...</p>
    </div>

    <div
      v-else-if="applications.length === 0"
      class="text-center text-gray-500 py-10"
    >
      Nenhuma aplicação encontrada com os filtros selecionados.
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
