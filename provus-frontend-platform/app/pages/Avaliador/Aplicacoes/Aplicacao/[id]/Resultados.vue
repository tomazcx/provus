<script setup lang="ts">
import Header from "@/components/Aplicacoes/AplicacoesHeader/index.vue";
import SubmissionsControls from "@/components/Aplicacoes/Resultados/SubmissionsControls.vue";
import SubmissionsTable from "@/components/Aplicacoes/Resultados/SubmissionsTable.vue";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import { useSubmissionsStore } from "~/store/submissionStore";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

const route = useRoute();
const applicationId = parseInt(route.params.id as string, 10);

const submissionsStore = useSubmissionsStore();
const applicationsStore = useApplicationsStore();

const aplicacao = ref<AplicacaoEntity | null>(null);
const searchFilter = ref("");
const statusFilter = ref<EstadoSubmissaoEnum | "Todos">("Todos");

const isLoading = computed(
  () => submissionsStore.isLoading || applicationsStore.isLoading
);

const breadcrumbs = computed(() => [
  { label: "Aplicações", to: "/aplicacoes" },
  {
    label: aplicacao.value?.avaliacao.titulo ?? "Detalhes",
    to: `/aplicacoes/aplicacao/${applicationId}`,
  },
  { label: "Resultados", disabled: true },
]);

onMounted(async () => {
  await submissionsStore.fetchSubmissions(applicationId);
  const appFromStore = applicationsStore.getApplicationById(applicationId);
  if (appFromStore) {
    aplicacao.value = appFromStore;
  } else {
    await applicationsStore.fetchApplications();
    aplicacao.value =
      applicationsStore.getApplicationById(applicationId) ?? null;
  }
});

const submissionsData = computed(() => submissionsStore.submissions);
</script>

<template>
  <div v-if="isLoading && !aplicacao" class="text-center p-8">
    <Icon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-primary" />
    <p class="text-gray-500 mt-2">Carregando dados da aplicação...</p>
  </div>

  <div v-else-if="aplicacao">
    <Breadcrumbs :items="breadcrumbs" />
    <Header
      :titulo="aplicacao.avaliacao.titulo"
      :descricao="aplicacao.avaliacao.descricao"
      :data-aplicacao="aplicacao.dataInicio.toISOString()"
    />

    <SubmissionsControls
      v-model:search="searchFilter"
      v-model:status="statusFilter"
    />

    <div class="text-sm text-gray-600 mb-4">
      Mostrando {{ submissionsData?.submissoes?.length ?? 0 }} submissões
    </div>

    <SubmissionsTable
      v-if="submissionsData"
      :submissions="submissionsData"
      :is-loading="submissionsStore.isLoading"
      :search-filter="searchFilter"
      :status-filter="statusFilter"
    />
  </div>

  <div v-else class="text-center p-8">
    <p class="text-red-500">Aplicação não encontrada.</p>
  </div>
</template>
