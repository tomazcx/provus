<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs/index.vue";
import SubmissionHeader from "@/components/Submissao/SubmissaoHeader/index.vue";
import SubmissionStats from "@/components/Submissao/SubmissaoStats/index.vue";
import AnsweredQuestionCard from "@/components/Submissao/AnsweredQuestionCard/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";
import type { AvaliadorSubmissaoDetalheApiResponse } from "~/types/api/response/AvaliadorSubmissaoDetalhe.response";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

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

const breadcrumbs = computed(() => [
  { label: "Aplicações", to: "/aplicacoes" },
  {
    label: aplicacao.value?.avaliacao.titulo ?? "Detalhes",
    to: `/aplicacoes/aplicacao/${applicationId}`,
  },
  {
    label: "Resultados",
    to: `/aplicacoes/aplicacao/${applicationId}/resultados`,
  },
  {
    label: submissionDetails.value?.estudante.nome ?? "Submissão",
    disabled: true,
  },
]);

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

async function handleSaveCorrection(
  questaoId: number,
  correcaoData: { pontuacao: number; textoRevisao: string }
) {
  isLoading.value = true;
  try {
    const questaoRef = submissionDetails.value?.questoes.find(
      (q) => q.id === questaoId
    );
    if (!questaoRef) throw new Error("Questão não encontrada localmente");

    let novoEstado: EstadoQuestaoCorrigida;

    if (correcaoData.pontuacao >= questaoRef.pontuacaoMaxima) {
      novoEstado = EstadoQuestaoCorrigida.CORRETA;
      correcaoData.pontuacao = questaoRef.pontuacaoMaxima;
    } else if (correcaoData.pontuacao > 0) {
      novoEstado = EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA;
    } else {
      novoEstado = EstadoQuestaoCorrigida.INCORRETA;
      correcaoData.pontuacao = 0;
    }

    const payload = {
      pontuacao: correcaoData.pontuacao,
      textoRevisao: correcaoData.textoRevisao,
      estadoCorrecao: novoEstado,
    };

    await $api(
      `/backoffice/aplicacao/${applicationId}/submissao/${submissionId}/questao/${questaoId}`,
      { method: "PATCH", body: payload }
    );

    questaoRef.pontuacaoObtida = payload.pontuacao;
    questaoRef.textoRevisao = payload.textoRevisao;
    questaoRef.estadoCorrecao = payload.estadoCorrecao;

    const novaPontuacaoTotal = submissionDetails.value!.questoes.reduce(
      (acc, q) => acc + (Number(q.pontuacaoObtida) || 0),
      0
    );

    submissionDetails.value = {
      ...submissionDetails.value!,
      submissao: {
        ...submissionDetails.value!.submissao,
        pontuacaoTotal: novaPontuacaoTotal,
      },
    };

    await checkAndFinalizeSubmission();

    toast.add({
      title: "Correção salva com sucesso!",
      color: "secondary",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Erro ao salvar correção",
      description: "Erro desconhecido",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
  } finally {
    isLoading.value = false;
  }
}

async function checkAndFinalizeSubmission() {
  if (!submissionDetails.value) return;

  const isAnyPending = submissionDetails.value.questoes.some(
    (q) =>
      q.estadoCorrecao === EstadoQuestaoCorrigida.NAO_RESPONDIDA ||
      q.estadoCorrecao === null
  );

  if (
    !isAnyPending &&
    submissionDetails.value.submissao.estado === EstadoSubmissaoEnum.ENVIADA
  ) {
    try {
      await $api(
        `/backoffice/aplicacao/${applicationId}/submissao/${submissionId}/estado`,
        { method: "PATCH", body: { estado: EstadoSubmissaoEnum.AVALIADA } }
      );

      submissionDetails.value = {
        ...submissionDetails.value,
        submissao: {
          ...submissionDetails.value.submissao,
          estado: EstadoSubmissaoEnum.AVALIADA,
        },
      };

      toast.add({
        title: "Correção Concluída!",
        description:
          "Todas as questões foram corrigidas. A nota final do aluno foi calculada.",
        color: "info",
        icon: "i-lucide-graduation-cap",
      });
    } catch {
      toast.add({
        title: "Erro ao finalizar submissão",
        description: "Não foi possível atualizar o estado da prova.",
        color: "error",
      });
    }
  }
}
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
    <Breadcrumbs :items="breadcrumbs" />
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
        @save-correction="handleSaveCorrection(questao.id, $event)"
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
