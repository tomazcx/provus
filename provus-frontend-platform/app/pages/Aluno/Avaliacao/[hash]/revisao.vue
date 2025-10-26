<script setup lang="ts">
import { useStudentAssessmentStore } from "~/store/studentAssessmentStore";
import ReviewHeader from "~/components/Aluno/Revisao/ReviewHeader/index.vue";
import ReviewSidebar from "~/components/Aluno/Revisao/ReviewSidebar/index.vue";
import ReviewedQuestionCard from "~/components/Aluno/Revisao/ReviewedQuestionCard/index.vue";

const route = useRoute();
const router = useRouter();
const studentAssessmentStore = useStudentAssessmentStore();
const toast = useToast();

const submissionDetails = computed(
  () => studentAssessmentStore.submissionDetails
);
const reviewQuestions = computed(() => studentAssessmentStore.reviewQuestions);
const isLoading = computed(() => studentAssessmentStore.isLoading);
const error = computed(() => studentAssessmentStore.error);
const tituloAvaliacao = computed(() => studentAssessmentStore.tituloAvaliacao);
const quantidadeTentativas = computed(
  () => studentAssessmentStore.quantidadeTentativas ?? 1
);
const allowRetake = computed(() => quantidadeTentativas.value > 1);

const pontuacaoTotalPossivel = computed(() => {
  return (
    reviewQuestions.value?.reduce(
      (sum, q) => sum + (q.pontuacaoMaxima ?? 0),
      0
    ) ?? 0
  );
});

const hasAttemptedLoad = ref(false);
onMounted(async () => {
  const hash = route.params.hash as string;
  if (hash && !hasAttemptedLoad.value) {
    hasAttemptedLoad.value = true;
    const success = await studentAssessmentStore.fetchSubmissionReviewData(
      hash
    );

    if (!success) {
      setTimeout(() => {
        if (studentAssessmentStore.submissionDetails?.hash) {
          router.push(
            `/aluno/avaliacao/${studentAssessmentStore.submissionDetails.hash}/finalizado`
          );
        } else {
          router.push("/aluno/entrar");
        }
      }, 2000);
    }
  } else if (!hash) {
    toast.add({
      title: "Erro",
      description: "Hash da avaliação não encontrado.",
      color: "error",
    });
    router.push("/aluno/entrar");
  }
});
</script>

<template>
  <div
    v-if="isLoading && !reviewQuestions"
    class="flex items-center justify-center min-h-screen"
  >
    <div class="text-center">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-12 w-12 text-primary"
      />
      <p class="mt-4 text-lg text-gray-600">Carregando revisão...</p>
    </div>
  </div>

  <div
    v-else-if="error"
    class="flex flex-col items-center justify-center min-h-screen p-4"
  >
    <UAlert
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      title="Erro ao Carregar Revisão"
      :description="error"
      class="mb-4 max-w-md text-center"
    />
    <UButton @click="router.push('/aluno/entrar')"
      >Voltar para o Início</UButton
    >
  </div>

  <div
    v-else-if="
      submissionDetails && reviewQuestions && reviewQuestions.length > 0
    "
  >
    <ReviewHeader
      :titulo-avaliacao="tituloAvaliacao"
      :allow-retake="allowRetake"
    />
    <div class="flex pt-20">
      <ReviewSidebar
        :submission="submissionDetails"
        :questions="reviewQuestions"
        :total-possible-score="pontuacaoTotalPossivel"
      />
      <main class="ml-80 flex-1 p-6 bg-gray-100">
        <div class="max-w-4xl mx-auto">
          <div class="space-y-6">
            <ReviewedQuestionCard
              v-for="(questao, index) in reviewQuestions"
              :key="questao.id"
              :questao="questao"
              :numero="index + 1"
            />
          </div>
        </div>
      </main>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center min-h-screen p-4"
  >
    <UAlert
      icon="i-lucide-search-x"
      color="warning"
      variant="soft"
      title="Revisão Indisponível"
      description="Não foi possível carregar os dados da revisão ou ela não está permitida."
      class="mb-4 max-w-md text-center"
    />
    <UButton @click="router.push('/aluno/entrar')"
      >Voltar para o Início</UButton
    >
  </div>
</template>
