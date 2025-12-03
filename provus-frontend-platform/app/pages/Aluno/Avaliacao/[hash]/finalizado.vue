<script setup lang="ts">
import { useStudentAssessmentStore } from "~/store/studentAssessmentStore";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import type { useWebSocket } from "~/composables/useWebSocket";

definePageMeta({
  layout: false,
});

const studentAssessmentStore = useStudentAssessmentStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const nuxtApp = useNuxtApp();

const $websocket = nuxtApp.$websocket as
  | ReturnType<typeof useWebSocket>
  | undefined;

const tituloAvaliacao = computed(() => studentAssessmentStore.tituloAvaliacao);
const nomeAvaliador = computed(() => studentAssessmentStore.nomeAvaliador);
const submissionDetails = computed(
  () => studentAssessmentStore.submissionDetails
);
const submissionQuestions = computed(
  () => studentAssessmentStore.submissionQuestions
);
const mostrarPontuacao = computed(
  () => studentAssessmentStore.mostrarPontuacao
);
const permitirRevisao = computed(() => studentAssessmentStore.permitirRevisao);
const isLoading = computed(() => studentAssessmentStore.isLoading);
const error = computed(() => studentAssessmentStore.error);
const pontuacaoMaximaAvaliacao = computed(
  () => studentAssessmentStore.pontuacaoMaximaAvaliacao
);

const pontuacaoTotalPossivel = computed(() => {
  if (
    pontuacaoMaximaAvaliacao.value !== null &&
    pontuacaoMaximaAvaliacao.value > 0
  ) {
    return pontuacaoMaximaAvaliacao.value;
  }

  return (
    submissionQuestions.value?.reduce(
      (sum, q) => sum + (q.pontuacao ?? 0),
      0
    ) ?? 0
  );
});

interface ResultadoProcessadoPayload {
  estado: EstadoSubmissaoEnum;
  pontuacaoTotal: number;
}

interface ConfigLiberacaoPayload {
  aplicacaoId: number;
  mostrarPontuacao: boolean;
  permitirRevisao: boolean;
}

function connectWebSocket(hash: string) {
  if (!$websocket) return;

  const authPayload = { hash: hash };

  if ($websocket.isConnected.value) {
    $websocket.connect(`/submissao`, authPayload);
  } else {
    $websocket.connect(`/submissao`, authPayload);
  }

  $websocket.on<ResultadoProcessadoPayload>("resultado-processado", (data) => {
    console.log("Resultado processado recebido:", data);

    if (studentAssessmentStore.submissionDetails) {
      studentAssessmentStore.submissionDetails.estado = data.estado;
      studentAssessmentStore.submissionDetails.pontuacaoTotal =
        data.pontuacaoTotal;
    }

    studentAssessmentStore.fetchSubmissionDataByHash(hash);

    toast.add({
      title: "Correção Finalizada!",
      description: "Sua nota já está disponível.",
      color: "success",
      icon: "i-lucide-party-popper",
    });
  });

  $websocket.on<ConfigLiberacaoPayload>(
    "configuracao-liberacao-atualizada",
    (data) => {
      console.log("Configuração atualizada via WS:", data);

      studentAssessmentStore.updateReleaseSettings({
        mostrarPontuacao: data.mostrarPontuacao,
        permitirRevisao: data.permitirRevisao,
      });

      toast.add({
        title: "Atualização",
        description: "O professor atualizou as permissões de visualização.",
        color: "info",
        icon: "i-lucide-refresh-cw",
      });
    }
  );
}

onMounted(async () => {
  const hash = route.params.hash as string;
  if (hash) {
    await studentAssessmentStore.fetchSubmissionDataByHash(hash);
    connectWebSocket(hash);
  } else {
    toast.add({
      title: "Erro",
      description: "Não foi possível carregar os dados da submissão.",
      color: "error",
    });
    router.push("/aluno/entrar");
  }
});

onUnmounted(() => {
  if ($websocket) {
    $websocket.disconnect();
  }
});

const scorePercent = computed(() => {
  if (!submissionDetails.value || !pontuacaoTotalPossivel.value) return 0;
  const score = submissionDetails.value.pontuacaoTotal ?? 0;
  const total =
    pontuacaoTotalPossivel.value > 0 ? pontuacaoTotalPossivel.value : 1;
  return Math.round((score / total) * 100);
});

const confirmationCode = computed(() => {
  return submissionDetails.value?.codigoEntrega?.toString() ?? "------";
});

const timeTaken = computed(() => {
  if (
    !submissionDetails.value?.criadoEm ||
    !submissionDetails.value?.finalizadoEm
  )
    return "-- minutos";
  try {
    const inicio = new Date(submissionDetails.value.criadoEm);
    const fim = new Date(submissionDetails.value.finalizadoEm);
    const diffMilissegundos = fim.getTime() - inicio.getTime();
    if (isNaN(diffMilissegundos) || diffMilissegundos < 0) {
      return "-- minutos";
    }
    const diffMinutos = Math.round(diffMilissegundos / 60000);
    if (diffMinutos < 1) return "< 1 minuto";
    if (diffMinutos === 1) return "1 minuto";
    return `${diffMinutos} minutos`;
  } catch (e) {
    console.error("Erro ao calcular tempo gasto:", e);
    return "-- minutos";
  }
});

function reviewAnswers() {
  if (submissionDetails.value?.hash) {
    router.push(`/aluno/avaliacao/${submissionDetails.value.hash}/revisao`);
  }
}

function backToHome() {
  router.push("/aluno/entrar");
}
</script>

<template>
  <div
    class="font-sans bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex items-center justify-center p-4"
  >
    <div v-if="isLoading" class="text-center">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-12 w-12 text-primary"
      />
      <p class="mt-4 text-lg text-gray-600">Carregando resultado...</p>
    </div>

    <div v-else-if="error" class="w-full max-w-md text-center">
      <UAlert
        icon="i-lucide-alert-triangle"
        color="error"
        variant="soft"
        title="Erro ao Carregar Resultado"
        :description="error"
        class="mb-4"
      />
      <UButton @click="backToHome">Voltar para o Início</UButton>
    </div>

    <UCard
      v-else-if="submissionDetails && submissionQuestions"
      class="w-full max-w-2xl"
    >
      <div class="text-center mb-4">
        <div
          class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Icon name="i-lucide-check" class="text-white text-4xl" />
        </div>
        <h1 class="text-2xl font-bold text-primary mb-4">
          Avaliação Enviada com Sucesso!
        </h1>
      </div>

      <UCard>
        <h2 class="text-xl font-semibold text-primary mb-4">
          Resumo da Avaliação
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Nome da Avaliação</p>
            <p class="font-semibold text-gray-900 truncate">
              {{ tituloAvaliacao ? stripHtml(tituloAvaliacao) : "Avaliação" }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Professor</p>
            <p class="font-semibold text-gray-900">
              {{ nomeAvaliador ?? "Prof. Responsável" }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Data de Envio</p>
            <p class="font-semibold text-gray-900">
              {{
                submissionDetails.finalizadoEm
                  ? new Date(submissionDetails.finalizadoEm).toLocaleString(
                      "pt-BR"
                    )
                  : "N/A"
              }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Tempo Utilizado</p>
            <p class="font-semibold text-gray-900">{{ timeTaken }}</p>
          </UCard>
        </div>

        <template
          v-if="
            mostrarPontuacao &&
            (submissionDetails.estado === EstadoSubmissaoEnum.AVALIADA ||
              submissionDetails.estado ===
                EstadoSubmissaoEnum.CODIGO_CONFIRMADO ||
              submissionDetails.estado === EstadoSubmissaoEnum.ENCERRADA)
          "
        >
          <UCard>
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-2">Sua Pontuação</p>
              <p class="text-3xl font-bold text-secondary mb-2">
                {{ submissionDetails.pontuacaoTotal ?? 0 }}/{{
                  pontuacaoTotalPossivel
                }}
              </p>
              <UProgress v-model="scorePercent" class="mt-4" />
            </div>
          </UCard>
        </template>

        <template
          v-else-if="submissionDetails.estado === EstadoSubmissaoEnum.ENVIADA"
        >
          <UAlert
            icon="i-lucide-loader-2"
            color="info"
            variant="subtle"
            title="Aguardando Correção"
            description="Sua avaliação foi enviada. Algumas questões estão aguardando a correção do professor. Sua nota final aparecerá aqui assim que for liberada."
            class="mt-4"
          />
        </template>

        <template v-else-if="mostrarPontuacao === false">
          <UAlert
            icon="i-lucide-lock"
            color="primary"
            variant="subtle"
            title="Pontuação Oculta"
            description="A pontuação desta avaliação será divulgada pelo professor posteriormente."
            class="mt-4"
          />
        </template>

        <template
          v-else-if="
            submissionDetails.estado === EstadoSubmissaoEnum.CANCELADA ||
            submissionDetails.estado === EstadoSubmissaoEnum.ENCERRADA
          "
        >
          <UAlert
            icon="i-lucide-ban"
            color="warning"
            variant="subtle"
            title="Avaliação Encerrada"
            description="Esta avaliação foi encerrada ou cancelada."
            class="mt-4"
          />
        </template>

        <template v-else>
          <UAlert
            icon="i-lucide-lock"
            color="primary"
            variant="subtle"
            title="Pontuação Oculta"
            description="A pontuação desta avaliação será divulgada pelo professor posteriormente."
            class="mt-4"
          />
        </template>
      </UCard>

      <div class="bg-primary rounded-xl p-6 mb-5 mt-5">
        <h3 class="text-white font-semibold mb-4 flex items-center">
          <Icon name="i-lucide-shield-check" class="mr-2" />
          Código de Confirmação de Envio
        </h3>
        <div class="bg-white rounded-lg p-4 mb-4 text-center">
          <p class="text-sm text-gray-600 mb-2">
            Apresente este código ao seu professor
          </p>
          <p class="text-2xl font-mono font-bold text-primary tracking-wider">
            {{ confirmationCode }}
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        <UButton
          v-if="
            permitirRevisao &&
            (submissionDetails.estado === EstadoSubmissaoEnum.AVALIADA ||
              submissionDetails.estado ===
                EstadoSubmissaoEnum.CODIGO_CONFIRMADO)
          "
          block
          color="primary"
          size="lg"
          icon="i-lucide-eye"
          @click="reviewAnswers"
        >
          Revisar Respostas
        </UButton>
        <UButton
          block
          color="primary"
          variant="outline"
          size="lg"
          icon="i-lucide-home"
          :class="{
            'w-full':
              !permitirRevisao ||
              (submissionDetails.estado !== EstadoSubmissaoEnum.AVALIADA &&
                submissionDetails.estado !==
                  EstadoSubmissaoEnum.CODIGO_CONFIRMADO),
          }"
          @click="backToHome"
        >
          Voltar para o Início
        </UButton>
      </div>
    </UCard>
  </div>
</template>
