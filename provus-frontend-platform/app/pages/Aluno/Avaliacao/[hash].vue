<script setup lang="ts">
import ExamHeader from "~/components/Aluno/Prova/ProvaHeader/index.vue";
import ExamSidebar from "~/components/Aluno/Prova/Sidebar/index.vue";
import QuestionCard from "~/components/Aluno/Prova/QuestionCard/index.vue";
import MaterialsDialog from "~/components/Aluno/Prova/MaterialsDialog/index.vue";
import ConfirmationDialog from "~/components/ui/ConfirmationDialog/index.vue";
import {
  useStudentAssessmentStore,
  type StudentAnswerData,
} from "~/store/studentAssessmentStore";
import { useTimer } from "~/composables/useTimer";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import { usePageVisibility } from "~/composables/usePageVisibility";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import { useWebSocket } from "~/composables/useWebSocket";

interface ErroValidacaoPayload {
  message: string;
  estado?: EstadoSubmissaoEnum;
}

interface ProgressoUpdatePayload {
  questoesRespondidas: number;
  totalQuestoes: number;
  questaoId: number;
  respondida: boolean;
  timestamp: string;
}

interface TempoAjustadoPayload {
  aplicacaoId: number;
  novaDataFimISO: string;
}

interface EstadoAplicacaoAtualizadoPayloadSubmissao {
  aplicacaoId: number;
  novoEstado: EstadoSubmissaoEnum;
  novaDataFimISO: string;
}

interface TempoReduzidoPayload {
  tempoReduzido: number;
}

interface AlertaEstudantePayload {
  quantidadeOcorrencias: number;
  tipoInfracao: string;
  penalidade: string;
  pontuacaoPerdida?: number;
}

interface SubmissaoCanceladaPayload {
  tipoInfracao: string;
  quantidadeOcorrencias: number;
}

const route = useRoute();
const router = useRouter();
const studentAssessmentStore = useStudentAssessmentStore();
const toast = useToast();
const currentSubmissionStatus = ref<EstadoSubmissaoEnum | null>(null);
const isMaterialsOpen = ref(false);
const viewMode = ref<"single" | "paginated">("single");
const dataFimRef = ref<string | null>(null);
const isSubmitConfirmOpen = ref(false);
const ajusteTempoPenalidade = ref(0);
const isExitingForSubmission = ref(false);
const lastInfractionTime = ref(0);

const isFullscreen = ref(true);
const showFullscreenBlocker = computed(() => {
  return proibirTrocarAbas.value && isTimerActive.value && !isFullscreen.value;
});

const isTimerActive = computed(
  () =>
    currentSubmissionStatus.value === EstadoSubmissaoEnum.INICIADA ||
    currentSubmissionStatus.value === EstadoSubmissaoEnum.REABERTA
);

const respostas = reactive<
  Record<number, StudentAnswerData | undefined | null>
>({});

function registrarInfracao(tipo: TipoInfracaoEnum) {
  const now = Date.now();
  if (now - lastInfractionTime.value < 2000) {
    console.log(`[Proctoring] Infração ignorada (Debounce): ${tipo}`);
    return;
  }

  lastInfractionTime.value = now;

  if (studentWebSocket.isConnected.value) {
    studentWebSocket.emit("registrar-punicao-por-ocorrencia", {
      tipoInfracao: tipo,
    });
  }
}

const studentWebSocket = useWebSocket();

const submissionDetails = computed(
  () => studentAssessmentStore.submissionDetails
);
const submissionQuestions = computed(
  () => studentAssessmentStore.submissionQuestions
);
const submissionFiles = computed(() => studentAssessmentStore.submissionFiles);
const isLoading = computed(() => studentAssessmentStore.isLoading);
const isSubmitting = computed(() => studentAssessmentStore.isSubmitting);
const error = computed(() => studentAssessmentStore.error);
const dataInicioAplicacao = computed(
  () => studentAssessmentStore.dataInicioAplicacao
);
const tempoMaximoAvaliacao = computed(
  () => studentAssessmentStore.tempoMaximoAvaliacao
);
const descricaoAvaliacao = computed(
  () => studentAssessmentStore.descricaoAvaliacao
);
const tituloAvaliacao = computed(
  () => studentAssessmentStore.tituloAvaliacao ?? "Carregando..."
);
const proibirTrocarAbas = computed(
  () => studentAssessmentStore.proibirTrocarAbas
);
const proibirCopiarColar = computed(
  () => studentAssessmentStore.proibirCopiarColar
);

const tempoPenalidadeStore = computed(
  () => studentAssessmentStore.tempoPenalidade
);

const { tempoRestanteFormatado } = useTimer({
  dataFimISO: dataFimRef,
  isActive: isTimerActive,
  ajusteDeTempoEmSegundos: ajusteTempoPenalidade,
});

watch(
  tempoPenalidadeStore,
  (newVal) => {
    ajusteTempoPenalidade.value = -(newVal || 0);
  },
  { immediate: true }
);

watch(
  submissionQuestions,
  (questions) => {
    if (questions) {
      questions.forEach((q) => {
        if (q.dadosResposta) {
          if ("texto" in q.dadosResposta) {
            respostas[q.id] = { texto: q.dadosResposta.texto };
          } else if ("alternativa_id" in q.dadosResposta) {
            respostas[q.id] = {
              alternativaId: q.dadosResposta.alternativa_id,
            };
          } else if ("alternativas_id" in q.dadosResposta) {
            respostas[q.id] = {
              alternativasId: q.dadosResposta.alternativas_id,
            };
          }
        }
      });
    }
  },
  { immediate: true }
);

watch(
  submissionDetails,
  (details) => {
    if (details) {
      currentSubmissionStatus.value = details.estado;
    }
  },
  { immediate: true }
);

watch(
  [dataInicioAplicacao, tempoMaximoAvaliacao],
  ([inicio, duracao]) => {
    if (inicio && duracao !== null && duracao !== undefined) {
      try {
        const dataInicioDate = new Date(inicio);
        const dataFimCalculada = new Date(
          dataInicioDate.getTime() + duracao * 60000
        );
        dataFimRef.value = dataFimCalculada.toISOString();
      } catch (e) {
        console.error("%%% Aluno: Erro ao calcular data fim inicial:", e);
        dataFimRef.value = null;
      }
    } else {
      dataFimRef.value = null;
    }
  },
  { immediate: true }
);

const answeredQuestions = computed(
  () =>
    new Set(
      Object.entries(respostas)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key]) => Number(key))
    )
);

const totalQuestoes = computed(() => submissionQuestions.value?.length ?? 0);
const pontuacaoTotalPossivel = computed(() => {
  return (
    submissionQuestions.value?.reduce(
      (sum, q) => sum + (q.pontuacao ?? 0),
      0
    ) ?? 0
  );
});

const questionsPerPage = 5;
const currentPage = ref(1);
const paginatedQuestions = computed(() => {
  if (!submissionQuestions.value) return [];
  const start = (currentPage.value - 1) * questionsPerPage;
  const end = start + questionsPerPage;
  return submissionQuestions.value.slice(start, end);
});
const startingQuestionNumber = computed(
  () => (currentPage.value - 1) * questionsPerPage
);

function goToQuestion(index: number) {
  if (viewMode.value === "paginated") {
    currentPage.value = Math.floor(index / questionsPerPage) + 1;
  }
  nextTick(() => {
    if (!submissionQuestions.value) return;
    const questionId = submissionQuestions.value[index]?.id;
    if (!questionId) return;
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function updateAnswer(questionId: number, answer: StudentAnswerData | null) {
  let isAnsweredNow = false;
  if (
    answer === null ||
    (typeof answer === "object" && Object.keys(answer).length === 0)
  ) {
    respostas[questionId] = undefined;
    isAnsweredNow = false;
  } else {
    respostas[questionId] = answer;
    isAnsweredNow = true;
  }

  const novaContagemRespondidas = Object.values(respostas).filter(
    (val) => val !== undefined && val !== null
  ).length;

  if (studentWebSocket.isConnected.value) {
    const payload: ProgressoUpdatePayload = {
      questaoId: questionId,
      respondida: isAnsweredNow,
      questoesRespondidas: novaContagemRespondidas,
      totalQuestoes: totalQuestoes.value,
      timestamp: new Date().toISOString(),
    };
    studentWebSocket.emit<ProgressoUpdatePayload>(
      "atualizar-progresso",
      payload
    );
  }
}

async function submit() {
  isSubmitConfirmOpen.value = true;
}

async function onConfirmSubmit() {
  isExitingForSubmission.value = true;
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {}
  }
  const success = await studentAssessmentStore.submitStudentAnswers(respostas);
  if (success && submissionDetails.value?.hash) {
    router.push(`/aluno/avaliacao/${submissionDetails.value.hash}/finalizado`);
  } else {
    isExitingForSubmission.value = false;
  }
}

function requestFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch((err) => {
      console.error(`Erro ao tentar entrar em fullscreen: ${err.message}`);
    });
  }
}

function checkFullscreenState() {
  isFullscreen.value = !!document.fullscreenElement;
}

function handleFullscreenChange() {
  const isNowFull = !!document.fullscreenElement;
  isFullscreen.value = isNowFull;
  if (
    !isNowFull &&
    proibirTrocarAbas.value &&
    isTimerActive.value &&
    !isExitingForSubmission.value
  ) {
    console.log("[Proctoring] Violação: Saiu do modo Tela Cheia.");
    registrarInfracao(TipoInfracaoEnum.TROCA_ABAS);
  }
}

function onVisibilityViolation() {
  console.log("[Proctoring] Violação de Visibilidade/Foco detectada.");
  if (proibirTrocarAbas.value && isTimerActive.value) {
    registrarInfracao(TipoInfracaoEnum.TROCA_ABAS);
  }
}

usePageVisibility(onVisibilityViolation);

function handleClipboardEvent(event: ClipboardEvent) {
  if (proibirCopiarColar.value && isTimerActive.value) {
    event.preventDefault();
    registrarInfracao(TipoInfracaoEnum.COPIAR_COLAR);
  }
}

function handleContextMenu(event: MouseEvent) {
  if (isTimerActive.value && proibirCopiarColar.value) {
    event.preventDefault();
  }
}

function connectWebSocket(hash: string) {
  const authPayload = { hash: hash };
  studentWebSocket.connect(`/submissao`, authPayload);

  studentWebSocket.on<ErroValidacaoPayload>("erro-validacao", (data) => {
    toast.add({
      title: "Erro de Conexão",
      description: data.message,
      color: "error",
    });

    if (
      data.estado &&
      data.estado !== EstadoSubmissaoEnum.INICIADA &&
      data.estado !== EstadoSubmissaoEnum.REABERTA
    ) {
      router.push(`/aluno/avaliacao/${hash}/finalizado`);
    } else {
      router.push("/aluno/entrar");
    }
  });

  studentWebSocket.on<EstadoAplicacaoAtualizadoPayloadSubmissao>(
    "estado-aplicacao-atualizado",
    (data) => {
      currentSubmissionStatus.value = data.novoEstado;
      dataFimRef.value = data.novaDataFimISO;
      if (
        (data.novoEstado === EstadoSubmissaoEnum.INICIADA ||
          data.novoEstado === EstadoSubmissaoEnum.REABERTA) &&
        proibirTrocarAbas.value
      ) {
        checkFullscreenState();
      }
      if (data.novoEstado === EstadoSubmissaoEnum.PAUSADA) {
        toast.add({
          title: "Avaliação Pausada",
          description: "O professor pausou a avaliação.",
          color: "warning",
        });
        if (document.fullscreenElement)
          document.exitFullscreen().catch(() => {});
      } else if (
        data.novoEstado === EstadoSubmissaoEnum.ENCERRADA ||
        data.novoEstado === EstadoSubmissaoEnum.CANCELADA
      ) {
        if (document.fullscreenElement)
          document.exitFullscreen().catch(() => {});
        toast.add({ title: "Avaliação Finalizada", color: "info" });
        setTimeout(() => {
          if (submissionDetails.value?.hash)
            router.push(
              `/aluno/avaliacao/${submissionDetails.value.hash}/finalizado`
            );
        }, 1500);
      }
    }
  );

  studentWebSocket.on<TempoAjustadoPayload>("tempo-ajustado", (data) => {
    dataFimRef.value = data.novaDataFimISO;
    toast.add({
      title: "Tempo Ajustado",
      description: "O tempo foi atualizado pelo professor.",
      color: "info",
    });
  });

  studentWebSocket.on<AlertaEstudantePayload>("alerta-estudante", (data) => {
    let desc = `Infração: ${data.tipoInfracao} (${data.quantidadeOcorrencias}x).`;
    if (data.pontuacaoPerdida) desc += ` -${data.pontuacaoPerdida} pontos.`;

    if (data.pontuacaoPerdida && data.pontuacaoPerdida > 0) {
      studentAssessmentStore.aplicarPenalidadePontos(data.pontuacaoPerdida);
    }

    toast.add({
      title: "Atenção!",
      description: desc,
      icon: "i-lucide-alert-triangle",
      color: "warning",
    });
  });

  studentWebSocket.on<TempoReduzidoPayload>("reduzir-tempo-aluno", (data) => {
    ajusteTempoPenalidade.value -= data.tempoReduzido;

    studentAssessmentStore.aplicarPenalidadeTempo(data.tempoReduzido);

    toast.add({
      title: "Penalidade de Tempo",
      description: `-${data.tempoReduzido} segundos.`,
      color: "error",
    });
  });

  studentWebSocket.on<SubmissaoCanceladaPayload>(
    "submissao-cancelada",
    (data) => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      toast.add({
        title: "Avaliação Cancelada",
        description: `Limite de infrações atingido (${data.tipoInfracao}).`,
        color: "error",
      });
      studentWebSocket.disconnect();
      if (submissionDetails.value?.hash)
        router.push(
          `/aluno/avaliacao/${submissionDetails.value.hash}/finalizado`
        );
    }
  );
}

watch(
  submissionDetails,
  (newDetails) => {
    if (newDetails?.hash && !studentWebSocket.isConnected.value) {
      connectWebSocket(newDetails.hash);
    } else if (!newDetails && studentWebSocket.isConnected.value) {
      studentWebSocket.disconnect();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  const hash = route.params.hash as string;
  if (hash) {
    await studentAssessmentStore.fetchSubmissionDataByHash(hash);
    checkFullscreenState();
  } else {
    router.push("/aluno/entrar");
  }
  document.addEventListener("copy", handleClipboardEvent);
  document.addEventListener("paste", handleClipboardEvent);
  document.addEventListener("cut", handleClipboardEvent);
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
  studentWebSocket.disconnect();
  document.removeEventListener("copy", handleClipboardEvent);
  document.removeEventListener("paste", handleClipboardEvent);
  document.removeEventListener("cut", handleClipboardEvent);
  document.removeEventListener("contextmenu", handleContextMenu);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-12 w-12 text-primary"
      />
      <p class="mt-4 text-lg text-gray-600">Carregando avaliação...</p>
    </div>
  </div>

  <div v-else-if="error" class="flex items-center justify-center min-h-screen">
    <UAlert
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      title="Erro"
      :description="error"
    />
    <UButton class="mt-4" @click="router.push('/aluno/entrar')">Voltar</UButton>
  </div>

  <div v-else-if="submissionDetails && submissionQuestions">
    <UModal :open="showFullscreenBlocker" prevent-close>
      <template #body>
        <div class="p-8 text-center">
          <div
            class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Icon name="i-lucide-maximize" class="text-red-600 text-4xl" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Modo Tela Cheia Obrigatório
          </h2>
          <p class="text-gray-600 mb-8 text-lg">
            Esta avaliação possui regras de segurança rígidas. Para continuar,
            você deve entrar em modo de tela cheia.
            <br /><span class="text-red-500 text-sm font-bold mt-2 block"
              >Sair da tela cheia será registrado como infração.</span
            >
          </p>
          <UButton size="xl" color="primary" block @click="requestFullscreen">
            Entrar em Tela Cheia e Continuar
          </UButton>
        </div>
      </template>
    </UModal>

    <ExamHeader
      :titulo-avaliacao="tituloAvaliacao"
      :tempo-restante-formatado="tempoRestanteFormatado"
      :is-submitting="isSubmitting"
      @submit="submit"
    />

    <div class="flex pt-16">
      <ExamSidebar
        :questoes="submissionQuestions"
        :arquivos="submissionFiles"
        :pontuacao-total="pontuacaoTotalPossivel"
        :answered-questions="answeredQuestions"
        :tempo-maximo="tempoMaximoAvaliacao"
        :descricao-avaliacao="descricaoAvaliacao"
        @go-to-question="goToQuestion"
        @open-materials="isMaterialsOpen = true"
        @toggle-view="viewMode = viewMode === 'single' ? 'paginated' : 'single'"
      />

      <main class="ml-80 flex-1 p-6">
        <div id="questions-container" class="max-w-4xl mx-auto">
          <div class="space-y-6">
            <template v-if="viewMode === 'single'">
              <QuestionCard
                v-for="(questao, index) in submissionQuestions"
                :id="`question-${questao.id}`"
                :key="questao.id"
                :questao="questao"
                :numero="index + 1"
                :is-answered="answeredQuestions.has(questao.id!)"
                :current-answer="respostas[questao.id]"
                @update:answer="(qid, payload) => updateAnswer(qid, payload as StudentAnswerData | null)"
              />
            </template>
            <template v-else>
              <QuestionCard
                v-for="(questao, index) in paginatedQuestions"
                :id="`question-${questao.id}`"
                :key="questao.id"
                :questao="questao"
                :numero="startingQuestionNumber + index + 1"
                :is-answered="answeredQuestions.has(questao.id!)"
                :current-answer="respostas[questao.id]"
                @update:answer="(qid, payload) => updateAnswer(qid, payload as StudentAnswerData | null)"
              />
              <div
                class="fixed bottom-6 left-1/2"
                style="transform: translateX(calc(-50% + 160px))"
              >
                <UPagination
                  v-if="totalQuestoes > questionsPerPage"
                  v-model="currentPage"
                  :page-count="questionsPerPage"
                  :total="totalQuestoes"
                  :active-button="{ variant: 'solid', color: 'primary' }"
                  size="xl"
                  class="bg-white p-2 rounded-lg shadow-md"
                />
              </div>
            </template>
          </div>
        </div>
      </main>
    </div>

    <MaterialsDialog v-model="isMaterialsOpen" :arquivos="submissionFiles" />

    <ConfirmationDialog
      v-model="isSubmitConfirmOpen"
      title="Entregar Avaliação?"
      description="Tem certeza que deseja enviar suas respostas? Esta ação não pode ser desfeita."
      confirm-label="Sim, entregar"
      confirm-color="secondary"
      @confirm="onConfirmSubmit"
    />
  </div>

  <div v-else class="flex items-center justify-center min-h-screen">
    <UAlert
      icon="i-lucide-search-x"
      color="warning"
      variant="soft"
      title="Dados Não Encontrados"
      description="Não foi possível carregar os detalhes da avaliação."
    />
    <UButton class="mt-4" @click="router.push('/aluno/entrar')">Voltar</UButton>
  </div>
</template>
