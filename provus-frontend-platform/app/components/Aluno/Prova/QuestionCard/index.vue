<script setup lang="ts">
import type { QuestaoSubmissaoResponse } from "~/types/api/response/Submissao.response";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { StudentAnswerData } from "~/store/studentAssessmentStore";

const props = defineProps<{
  questao: QuestaoSubmissaoResponse;
  numero: number;
  isAnswered: boolean;
}>();

const emit = defineEmits<{
  (
    e: "update:answer",
    questionId: number,
    payload: StudentAnswerData | null
  ): void;
}>();

const discursiveAnswer = ref("");
const objectiveAnswer = ref<number | undefined>(undefined);
const multipleChoiceAnswer = ref<number[]>([]);
const trueFalseAnswers = ref<Record<number, boolean | undefined>>({});

watch(discursiveAnswer, (newValue) => {
  if (props.questao.tipo === TipoQuestaoEnum.DISCURSIVA) {
    if (!newValue || newValue.trim() === "") {
      emit("update:answer", props.questao.id, null);
      return;
    }
    emit("update:answer", props.questao.id, { texto: newValue });
  }
});

watch(objectiveAnswer, (newValue) => {
  if (props.questao.tipo === TipoQuestaoEnum.OBJETIVA) {
    if (newValue === undefined || newValue === null) {
      emit("update:answer", props.questao.id, { alternativaId: null });
    } else {
      emit("update:answer", props.questao.id, {
        alternativaId: Number(newValue),
      });
    }
  }
});

watch(
  [multipleChoiceAnswer, trueFalseAnswers],
  () => {
    if (props.questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA) {
      if (multipleChoiceAnswer.value.length === 0) {
        emit("update:answer", props.questao.id, null);
      } else {
        emit("update:answer", props.questao.id, {
          alternativasId: multipleChoiceAnswer.value.map(Number),
        });
      }
    } else if (props.questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO) {
      const answeredAlternativeIds = Object.entries(trueFalseAnswers.value)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => Number(key));

      if (answeredAlternativeIds.length === 0) {
        emit("update:answer", props.questao.id, null);
        return;
      }

      const trueAnswerIds = Object.entries(trueFalseAnswers.value)
        .filter(([, value]) => value === true)
        .map(([key]) => Number(key));

      emit("update:answer", props.questao.id, {
        alternativasId: trueAnswerIds,
      });
    }
  },
  { deep: true }
);

function handleTrueFalseSelection(alternativeId: number, choice: boolean) {
  if (trueFalseAnswers.value[alternativeId] === choice) {
    trueFalseAnswers.value[alternativeId] = undefined;
  } else {
    trueFalseAnswers.value[alternativeId] = choice;
  }
}
</script>

<template>
  <UCard v-id="questao" class="question-card shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <span
          class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium"
          >{{ numero }}</span
        >
        <span class="text-sm font-medium text-gray-500"
          >{{ questao.pontuacao }} pontos</span
        >
      </div>
      <div
        class="w-3 h-3 rounded-full"
        :class="isAnswered ? 'bg-secondary' : 'bg-gray-300'"
      />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-3">
      {{ questao.titulo }}
    </h3>
    <p v-if="questao.descricao" class="text-gray-600 mb-4">
      {{ questao.descricao }}
    </p>

    <div
      v-if="questao.tipo === TipoQuestaoEnum.DISCURSIVA"
      class="space-y-3 w-full"
    >
      <UTextarea
        v-model="discursiveAnswer"
        :rows="6"
        placeholder="Digite sua resposta aqui..."
        class="w-full"
      />
    </div>

    <div v-else class="space-y-3">
      <URadioGroup
        v-if="questao.tipo === TipoQuestaoEnum.OBJETIVA"
        v-model="objectiveAnswer"
        :items="
          (questao.alternativas || []).map((alt) => ({
            value: alt.id !== undefined ? String(alt.id) : undefined,
            label: alt.descricao,
            description: alt.descricao,
          }))
        "
        color="primary"
        variant="table"
      />
      <UCheckboxGroup
        v-else-if="questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA"
        v-model="multipleChoiceAnswer"
        :items="
          (questao.alternativas || []).map((alt) => ({
            value: alt.id !== undefined ? String(alt.id) : undefined,
            label: alt.descricao,
            description: alt.descricao,
          }))
        "
        color="primary"
        variant="table"
      />

      <div
        v-else-if="questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO"
        class="space-y-3"
      >
        <div
          v-for="alt in questao.alternativas"
          :key="alt.id"
          class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
        >
          <span class="text-gray-800 flex-1 mr-4">{{ alt.descricao }}</span>
          <div class="flex items-center space-x-2">
            <UButton
              label="V"
              :variant="trueFalseAnswers[alt.id!] === true ? 'solid' : 'outline'"
              color="secondary"
              @click="handleTrueFalseSelection(alt.id!, true)"
            />
            <UButton
              label="F"
              :variant="trueFalseAnswers[alt.id!] === false ? 'solid' : 'outline'"
              color="error"
              @click="handleTrueFalseSelection(alt.id!, false)"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
