<script setup lang="ts">
import ExamHeader from "~/components/Aluno/Prova/ProvaHeader/index.vue";
import ExamSidebar from "~/components/Aluno/Prova/Sidebar/index.vue";
import QuestionCard from "~/components/Aluno/Prova/QuestionCard/index.vue";
import MaterialsDialog from "~/components/Aluno/Prova/MaterialsDialog/index.vue";
import {
  useStudentAssessmentStore,
  type StudentAnswerData,
} from "~/store/studentAssessmentStore";
import { useTimer } from "~/composables/useTimer";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

const route = useRoute();
const router = useRouter();
const studentAssessmentStore = useStudentAssessmentStore();
const toast = useToast();

const isMaterialsOpen = ref(false);
const viewMode = ref<"single" | "paginated">("single");
const respostas = reactive<
  Record<number, StudentAnswerData | undefined | null>
>({});

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
  () => submissionQuestions.value?.[0]?.titulo ?? "Carregando..."
);

const mockAjusteSegundos = ref(0);
const isTimerActive = computed(
  () => submissionDetails.value?.estado === EstadoSubmissaoEnum.INICIADA
);

const { tempoRestanteFormatado } = useTimer({
  dataAplicacao: dataInicioAplicacao,
  tempoMaximoEmMinutos: tempoMaximoAvaliacao,
  ajusteDeTempoEmSegundos: mockAjusteSegundos,
  isActive: isTimerActive,
});

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
  if (answer === null) {
    respostas[questionId] = undefined;
  } else {
    respostas[questionId] = answer;
  }
}

async function submitTest() {
  const confirmSubmit = confirm(
    "Tem certeza que deseja enviar suas respostas? Esta ação não pode ser desfeita."
  );
  if (!confirmSubmit) return;

  const success = await studentAssessmentStore.submitStudentAnswers(respostas);

  if (success && submissionDetails.value?.hash) {
    router.push(`/aluno/avaliacao/${submissionDetails.value.hash}/finalizado`);
  }
}

onMounted(() => {
  const hash = route.params.hash as string;
  if (hash) {
    studentAssessmentStore.fetchSubmissionDataByHash(hash);
  } else {
    console.error("Hash não encontrado na rota!");
    toast.add({
      title: "Erro",
      description: "Não foi possível identificar a avaliação.",
      color: "error",
    });
    router.push("/aluno/entrar");
  }
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
      title="Erro ao Carregar Avaliação"
      :description="error"
    />
    <UButton class="mt-4" @click="router.push('/aluno/entrar')">Voltar</UButton>
  </div>

  <div v-else-if="submissionDetails && submissionQuestions">
    <ExamHeader
      :titulo-avaliacao="tituloAvaliacao"
      :tempo-restante-formatado="tempoRestanteFormatado"
      :is-submitting="isSubmitting"
      @submit="submitTest"
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
  </div>
  <div v-else class="flex items-center justify-center min-h-screen">
    <UAlert
      icon="i-lucide-search-x"
      color="warning"
      variant="soft"
      title="Dados Não Encontrados"
      description="Não foi possível carregar os detalhes da avaliação. Tente acessar novamente."
    />
    <UButton class="mt-4" @click="router.push('/aluno/entrar')">Voltar</UButton>
  </div>
</template>
