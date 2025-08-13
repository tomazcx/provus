<script setup lang="ts">
import ExamHeader from "~/components/Aluno/Prova/ProvaHeader/index.vue";
import ExamSidebar from "~/components/Aluno/Prova/Sidebar/index.vue";
import QuestionCard from "~/components/Aluno/Prova/QuestionCard/index.vue";
import MaterialsDialog from "~/components/Aluno/Prova/MaterialsDialog/index.vue";
import { useStudentAssessmentStore } from "~/store/studentAssessmentStore";

type TAnswerPayload =
  | { texto: string }
  | { alternativaId: number | undefined }
  | { alternativasId: number[] };

const route = useRoute();
const router = useRouter();
const studentAssessmentStore = useStudentAssessmentStore();

const avaliacao = computed(() => studentAssessmentStore.assessment);
const isMaterialsOpen = ref(false);
const viewMode = ref<"single" | "paginated">("single");

const respostas = reactive<Record<number, TAnswerPayload | undefined>>({});
const answeredQuestions = computed(
  () =>
    new Set(
      Object.entries(respostas)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => Number(key))
    )
);

const questionsPerPage = 5;
const currentPage = ref(1);

const paginatedQuestions = computed(() => {
  if (!avaliacao.value) return [];
  const start = (currentPage.value - 1) * questionsPerPage;
  const end = start + questionsPerPage;
  return avaliacao.value.questoes.slice(start, end);
});

const startingQuestionNumber = computed(() => {
  return (currentPage.value - 1) * questionsPerPage;
});

function goToQuestion(index: number) {
  if (viewMode.value === "paginated") {
    currentPage.value = Math.floor(index / questionsPerPage) + 1;
  }

  nextTick(() => {
    if (!avaliacao.value) return;
    const questionId = avaliacao.value.questoes[index]?.id;
    if (!questionId) return;

    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function updateAnswer(questionId: number, answer: TAnswerPayload | null) {
  if (answer === null) {
    respostas[questionId] = undefined;
  } else if ("alternativaId" in answer) {
    if (
      typeof answer.alternativaId === "number" &&
      answer.alternativaId !== undefined
    ) {
      respostas[questionId] = { alternativaId: answer.alternativaId };
    } else {
      respostas[questionId] = undefined;
    }
  } else {
    respostas[questionId] = answer;
  }
}

function submitTest() {
  const studentInfo = {
    name: localStorage.getItem("student_name") || "Aluno Anônimo",
    email: localStorage.getItem("student_email") || "",
  };

  const success = studentAssessmentStore.submitExam(respostas, studentInfo);

  if (success) {
    router.push(`/aluno/avaliacao/${route.params.codigo}/finalizado`);
  } else {
    alert("Ocorreu um erro ao enviar sua avaliação.");
  }
}

onMounted(() => {
  const examCode = route.params.codigo as string;
  if (examCode) {
    studentAssessmentStore.fetchExamByCode(examCode);
  }
});
</script>

<template>
  <div
    v-if="studentAssessmentStore.isLoading"
    class="flex items-center justify-center min-h-screen"
  >
    <div class="text-center">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-12 w-12 text-primary"
      />
      <p class="mt-4 text-lg text-gray-600">Carregando avaliação...</p>
    </div>
  </div>

  <div
    v-else-if="studentAssessmentStore.error"
    class="flex items-center justify-center min-h-screen"
  >
    <UAlert
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      title="Erro ao Carregar Avaliação"
      :description="studentAssessmentStore.error"
    />
  </div>

  <div v-else-if="avaliacao">
    <ExamHeader :avaliacao="avaliacao" @submit="submitTest" />

    <div class="flex pt-16">
      <ExamSidebar
        :avaliacao="avaliacao"
        :answered-questions="answeredQuestions"
        @go-to-question="goToQuestion"
        @open-materials="isMaterialsOpen = true"
        @toggle-view="viewMode = viewMode === 'single' ? 'paginated' : 'single'"
      />

      <main class="ml-80 flex-1 p-6">
        <div id="questions-container" class="max-w-4xl mx-auto">
          <div class="space-y-6">
            <template v-if="viewMode === 'single'">
              <QuestionCard
                v-for="(questao, index) in avaliacao.questoes"
                :id="`question-${questao.id}`"
                :key="questao.id"
                :questao="questao"
                :numero="index + 1"
                :is-answered="answeredQuestions.has(questao.id!)"
                @update:answer="updateAnswer"
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
                @update:answer="updateAnswer"
              />
              <div
                class="fixed bottom-6 left-1/2"
                style="transform: translateX(calc(-50% + 160px))"
              >
                <UPagination
                  v-if="avaliacao.questoes.length > questionsPerPage"
                  v-model="currentPage"
                  :page-count="questionsPerPage"
                  :total="avaliacao.questoes.length"
                  :active-button="{ variant: 'solid' }"
                  size="xl"
                />
              </div>
            </template>
          </div>
        </div>
      </main>
    </div>

    <MaterialsDialog
      v-model="isMaterialsOpen"
      :materiais="avaliacao.configuracoes.materiaisAnexados"
    />
  </div>
</template>
