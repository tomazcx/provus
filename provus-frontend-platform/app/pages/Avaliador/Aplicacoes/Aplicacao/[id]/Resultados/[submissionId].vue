<script setup lang="ts">
import { useApplicationsStore } from "~/store/applicationsStore";
import { useSubmissionsStore } from "~/store/submissionStore";
import type { IAplicacao } from "~/types/IAplicacao";
import type { ISubmissao } from "~/types/ISubmissao";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import SubmissionHeader from "@/components/Submissao/SubmissaoHeader/index.vue";
import SubmissionStats from "@/components/Submissao/SubmissaoStats/index.vue";
import AnsweredQuestionCard from "@/components/Submissao/AnsweredQuestionCard/index.vue";

const route = useRoute();
const submissionsStore = useSubmissionsStore();
const applicationsStore = useApplicationsStore();

const applicationId = parseInt(route.params.id as string, 10);
const submissionId = parseInt(route.params.submissionId as string, 10);

const aplicacao = ref<IAplicacao | null>(null);
const submission = ref<ISubmissao | null>(null);

const pontuacaoTotalDaProva = computed(() => {
  return submissionsStore.response?.pontuacaoTotal || 0;
});

onMounted(async () => {
  await submissionsStore.fetchSubmissions(applicationId);
  await applicationsStore.fetchItems();

  submission.value = submissionsStore.getSubmissionById(submissionId) || null;
  aplicacao.value = applicationsStore.getApplicationById(applicationId) || null;
});
</script>

<template>
  <div v-if="submission && aplicacao">
    <Breadcrumbs
      :aplicacao="aplicacao"
      :submission="submission"
      level="submission"
    />

    <SubmissionHeader
      :submission="submission"
      :total-score="pontuacaoTotalDaProva"
    />
    <SubmissionStats :submission="submission" />

    <div class="space-y-6 mt-8">
      <h2 class="text-xl font-semibold text-gray-800">Respostas do Aluno</h2>
      <AnsweredQuestionCard
        v-for="(questao, index) in submission.questoesRespondidas"
        :key="questao.id"
        :questao="questao"
        :numero="index + 1"
      />
    </div>
  </div>
  <div v-else class="text-center p-8">
    <p class="text-gray-500">Carregando dados da submissão...</p>
  </div>
</template>
