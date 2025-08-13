<script setup lang="ts">
import type { ISubmissao } from "~/types/ISubmissao";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";

const props = defineProps<{
  submission: ISubmissao;
  totalScore: number;
}>();

const scorePercent = computed(() => {
  if (!props.totalScore) return 0;
  return Math.round((props.submission.pontuacaoTotal / props.totalScore) * 100);
});

const correctAnswersCount = computed(() => {
  return props.submission.questoesRespondidas.filter(
    (q) => q.resposta?.estadoCorrecao === EstadoQuestaoCorrigida.CORRETA
  ).length;
});

function getQuestionStatus(questaoId: number | undefined) {
  const questao = props.submission.questoesRespondidas.find(
    (q) => q.id === questaoId
  );
  return questao?.resposta?.estadoCorrecao;
}
</script>

<template>
  <div
    class="fixed left-0 top-20 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto"
  >
    <div class="p-6">
      <div class="mb-6 text-center">
        <div class="text-2xl font-bold">{{ scorePercent }}%</div>
        <UProgress v-model="scorePercent" type="circle" />
      </div>

      <UCard>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Pontuação Total:</span>
            <span class="font-bold text-primary"
              >{{ submission.pontuacaoTotal }}/{{ totalScore }} pontos</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Questões Corretas:</span>
            <span class="font-medium"
              >{{ correctAnswersCount }}/{{
                submission.questoesRespondidas.length
              }}</span
            >
          </div>
        </div>
      </UCard>

      <div>
        <h3 class="text-md font-semibold text-gray-900 mb-3 mt-5">
          Resultados por Questão
        </h3>
        <div class="space-y-2">
          <UButton
            v-for="(questao, index) in submission.questoesRespondidas"
            :key="questao.id"
            block
            variant="soft"
            :color="
              getQuestionStatus(questao.id) === EstadoQuestaoCorrigida.CORRETA
                ? 'secondary'
                : 'error'
            "
          >
            <span class="font-medium">Questão {{ index + 1 }}</span>
            <template #trailing>
              <span class="font-semibold"
                >{{ questao.resposta?.pontuacao }}/{{ questao.pontuacao }}</span
              >
            </template>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
