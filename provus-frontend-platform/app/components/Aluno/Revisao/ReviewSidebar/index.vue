<script setup lang="ts">
import type { SubmissaoResponse } from "~/types/api/response/Submissao.response";
import type { QuestaoRevisaoResponse } from "~/types/api/response/Revisao.response";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

const props = defineProps<{
  submission: SubmissaoResponse | null;
  questions: QuestaoRevisaoResponse[] | null;
  totalPossibleScore: number;
  descricaoAvaliacao?: string | null;
}>();

const scorePercent = computed(() => {
  if (!props.submission?.pontuacaoTotal || !props.totalPossibleScore) return 0;
  return Math.round(
    (props.submission.pontuacaoTotal / props.totalPossibleScore) * 100
  );
});

const correctAnswersCount = computed(() => {
  if (!props.questions) return 0;
  return props.questions.filter(
    (q) => q.estadoCorrecao === EstadoQuestaoCorrigida.CORRETA
  ).length;
});

const totalQuestions = computed(() => props.questions?.length ?? 0);

function getQuestionButtonColor(
  status: EstadoQuestaoCorrigida | null
): "secondary" | "warning" | "error" | "primary" {
  switch (status) {
    case EstadoQuestaoCorrigida.CORRETA:
      return "secondary";
    case EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA:
      return "warning";
    case EstadoQuestaoCorrigida.INCORRETA:
      return "error";
    case EstadoQuestaoCorrigida.NAO_RESPONDIDA:
    default:
      return "primary";
  }
}

function scrollToQuestion(id: number) {
  const element = document.getElementById(`question-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
</script>

<template>
  <div
    class="fixed left-0 top-20 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto"
  >
    <div v-if="submission && questions" class="p-6">
      <div class="mb-6 text-center">
        <div class="text-2xl font-bold text-primary">{{ scorePercent }}%</div>
        <UProgress :model-value="scorePercent" color="primary" indicator />
      </div>
      <UCard size="sm" class="mb-6">
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Pontuação Total:</span>
            <span class="font-bold text-primary"
              >{{ submission.pontuacaoTotal ?? 0 }}/{{
                totalPossibleScore
              }}
              pontos</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Questões Corretas:</span>
            <span class="font-medium"
              >{{ correctAnswersCount }}/{{ totalQuestions }}</span
            >
          </div>
        </div>
      </UCard>

      <div
        v-if="descricaoAvaliacao"
        class="mb-6 bg-gray-50 rounded-md p-3 border border-gray-100"
      >
        <h4 class="text-xs font-bold text-gray-500 uppercase mb-1">
          Instruções
        </h4>
        <RichTextEditor
          :model-value="descricaoAvaliacao"
          disabled
          min-height=""
          class="!p-0 !bg-transparent !border-none pointer-events-none text-sm text-gray-700"
        />
      </div>
      <div>
        <h3 class="text-md font-semibold text-gray-900 mb-3 mt-5">
          Resultados por Questão
        </h3>
        <div class="space-y-2">
          <UButton
            v-for="(questao, index) in questions"
            :key="questao.id"
            block
            variant="soft"
            :color="getQuestionButtonColor(questao.estadoCorrecao)"
            size="sm"
            class="justify-between"
            @click="scrollToQuestion(questao.id)"
          >
            <span class="font-medium truncate pr-2"
              >Questão {{ index + 1 }}</span
            >
            <span class="font-semibold text-xs shrink-0"
              >{{ questao.pontuacaoObtida ?? "?" }}/{{
                questao.pontuacaoMaxima
              }}</span
            >
          </UButton>
        </div>
      </div>
    </div>
    <div v-else class="p-6 text-center text-gray-500">
      Carregando dados da revisão...
    </div>
  </div>
</template>

<style scoped>
:deep(.prose p) {
  margin: 0;
}
</style>
