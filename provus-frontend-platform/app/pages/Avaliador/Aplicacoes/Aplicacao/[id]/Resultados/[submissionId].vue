<script setup lang="ts">
// import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import SubmissionHeader from "@/components/Submissao/SubmissaoHeader/index.vue";
import SubmissionStats from "@/components/Submissao/SubmissaoStats/index.vue";
import AnsweredQuestionCard from "@/components/Submissao/AnsweredQuestionCard/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliadorSubmissaoDetalheApiResponse } from "~/types/api/response/AvaliadorSubmissaoDetalhe.response";

const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();
const toast = useToast();
const applicationsStore = useApplicationsStore();

const applicationId = parseInt(route.params.id as string, 10);
const submissionId = parseInt(route.params.submissionId as string, 10);

const aplicacao = ref<AplicacaoEntity | null>(null);
const submissionDetails = ref<AvaliadorSubmissaoDetalheApiResponse | null>(
  null
);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function fetchData() {
  isLoading.value = true;
  error.value = null;
  try {
    aplicacao.value =
      applicationsStore.getApplicationById(applicationId) ?? null;
    if (!aplicacao.value) {
      await applicationsStore.fetchApplications();
      aplicacao.value =
        applicationsStore.getApplicationById(applicationId) ?? null;
    }
    if (!aplicacao.value) {
      throw new Error("Aplicação não encontrada.");
    }

    const response = await $api<AvaliadorSubmissaoDetalheApiResponse>(
      `/backoffice/aplicacao/${applicationId}/submissao/${submissionId}`
    );
    submissionDetails.value = response;
  } catch (error) {
    console.error("Erro ao buscar detalhes da submissão:", error);
    const errorMessage = "Não foi possível carregar os detalhes da aplicação.";
    toast.add({
      title: "Erro",
      description: errorMessage,
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    router.push("/aplicacoes");
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
</script>
<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
    <div class="text-center">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-12 w-12 text-primary"
      />

      <p class="mt-4 text-lg text-gray-600">
        Carregando detalhes da submissão...
      </p>
    </div>
  </div>

  <div
    v-else-if="error"
    class="flex flex-col items-center justify-center min-h-[50vh] p-4"
  >
    <UAlert
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      title="Erro ao Carregar Dados"
      :description="error"
      class="mb-4 max-w-md text-center"
    />
    <UButton @click="router.back()">Voltar</UButton>
  </div>

  <div v-else-if="submissionDetails && aplicacao">
    <!-- <Breadcrumbs
      :aplicacao="aplicacao"
      :submission="submissionDetails"
      level="submission"
    /> -->

    <SubmissionHeader
      :submission="submissionDetails.submissao"
      :student="submissionDetails.estudante"
      :total-score="submissionDetails.pontuacaoTotalAvaliacao"
    />

    <SubmissionStats
      :questions="submissionDetails.questoes"
      :submission="submissionDetails.submissao"
    />

    <div class="space-y-6 mt-8">
      <h2 class="text-xl font-semibold text-gray-800">Respostas Detalhadas</h2>

      <AnsweredQuestionCard
        v-for="(questao, index) in submissionDetails.questoes"
        :key="questao.id"
        :questao="questao"
        :numero="index + 1"
      />
    </div>
  </div>

  <div v-else class="flex items-center justify-center min-h-[50vh]">
    <UAlert
      icon="i-lucide-search-x"
      color="warning"
      variant="soft"
      title="Dados Não Encontrados"
      description="Não foi possível encontrar os dados para esta submissão ou aplicação."
    />
  </div>
</template>
