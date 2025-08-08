<script setup lang="ts">
import Header from "@/components/Aplicacoes/Header/index.vue";
import SubmissionsControls from "@/components/Aplicacoes/Resultados/SubmissionsControls.vue";
import SubmissionsTable from "@/components/Aplicacoes/Resultados/SubmissionsTable.vue";
import Breadcrumbs from "@/components/Aplicacoes/Breadcrumbs/index.vue";

import { useSubmissionsStore } from "~/store/submissionStore";
import { useApplicationsStore } from "~/store/applicationsStore";

const route = useRoute();
const applicationId = parseInt(route.params.id as string, 10);

const submissionsStore = useSubmissionsStore();
const applicationsStore = useApplicationsStore();

const aplicacao = computed(() =>
  applicationsStore.getApplicationById(applicationId)
);

onMounted(() => {
  submissionsStore.fetchSubmissions(applicationId);
  applicationsStore.fetchItems();
});
</script>

<template>
  <div v-if="submissionsStore.submissions && aplicacao">
    <Breadcrumbs :aplicacao="aplicacao" level="results" />

    <Header
      :titulo="aplicacao.titulo"
      :descricao="aplicacao.descricao"
      :data-aplicacao="aplicacao.dataAplicacao"
    />

    <SubmissionsControls :submissions="submissionsStore.submissions" />
    <div class="text-sm text-gray-600">
      Mostrando {{ submissionsStore.submissions?.submissoes.length }} submissões
    </div>

    <SubmissionsTable
      :submissions="submissionsStore.submissions"
      :is-loading="submissionsStore.isLoading"
    />
  </div>
</template>
