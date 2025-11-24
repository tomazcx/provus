<script setup lang="ts">
import type { QuestaoSubmissaoResponse } from "~/types/api/response/Submissao.response";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { StudentAnswerData } from "~/store/studentAssessmentStore";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

const props = defineProps<{
  questao: QuestaoSubmissaoResponse;
  numero: number;
  isAnswered: boolean;
  currentAnswer?: StudentAnswerData | null;
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

function syncStateFromProp(answer: StudentAnswerData | null | undefined) {
  if (!answer) {
    discursiveAnswer.value = "";
    objectiveAnswer.value = undefined;
    multipleChoiceAnswer.value = [];
    trueFalseAnswers.value = {};
    return;
  }

  if ("texto" in answer && answer.texto) {
    discursiveAnswer.value = answer.texto;
  } else if (
    "alternativaId" in answer &&
    typeof answer.alternativaId === "number"
  ) {
    objectiveAnswer.value = answer.alternativaId;
  } else if (
    "alternativasId" in answer &&
    Array.isArray(answer.alternativasId)
  ) {
    if (props.questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA) {
      multipleChoiceAnswer.value = [...answer.alternativasId];
    } else if (props.questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO) {
      trueFalseAnswers.value = {};
      answer.alternativasId.forEach((id) => {
        trueFalseAnswers.value[id] = true;
      });
    }
  }
}

onMounted(() => {
  syncStateFromProp(props.currentAnswer);
});

watch(
  () => props.currentAnswer,
  (newVal) => {
    syncStateFromProp(newVal);
  }
);

watch(discursiveAnswer, (newValue) => {
  if (props.questao.tipo === TipoQuestaoEnum.DISCURSIVA) {
    if (
      props.currentAnswer &&
      "texto" in props.currentAnswer &&
      props.currentAnswer.texto === newValue
    )
      return;

    if (!newValue || newValue.trim() === "") {
      emit("update:answer", props.questao.id, null);
      return;
    }
    emit("update:answer", props.questao.id, { texto: newValue });
  }
});

function handleObjectiveSelection(id: number) {
  objectiveAnswer.value = id;
  emit("update:answer", props.questao.id, { alternativaId: id });
}

watch(
  multipleChoiceAnswer,
  (newVal) => {
    if (props.questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA) {
      if (newVal.length === 0) {
        emit("update:answer", props.questao.id, null);
      } else {
        emit("update:answer", props.questao.id, {
          alternativasId: [...newVal],
        });
      }
    }
  },
  { deep: true }
);

watch(
  trueFalseAnswers,
  (newVal) => {
    if (props.questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO) {
      const trueAnswerIds = Object.entries(newVal)
        .filter(([, value]) => value === true)
        .map(([key]) => Number(key));

      const answeredCount = Object.values(newVal).filter(
        (v) => v !== undefined
      ).length;

      if (answeredCount === 0) {
        emit("update:answer", props.questao.id, null);
      } else {
        emit("update:answer", props.questao.id, {
          alternativasId: trueAnswerIds,
        });
      }
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

function toggleMultipleChoice(id: number) {
  const index = multipleChoiceAnswer.value.indexOf(id);
  if (index === -1) {
    multipleChoiceAnswer.value.push(id);
  } else {
    multipleChoiceAnswer.value.splice(index, 1);
  }
}
</script>

<template>
  <UCard
    v-if="questao"
    :id="`question-${questao.id}`"
    class="question-card shadow-sm"
  >
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

    <div class="text-lg font-semibold text-gray-900 mb-3">
      <RichTextEditor
        :model-value="questao.titulo"
        disabled
        min-height=""
        class="!p-0 !bg-transparent !border-none pointer-events-none"
      />
    </div>

    <div v-if="questao.descricao" class="text-gray-600 mb-4 text-sm">
      <RichTextEditor
        :model-value="questao.descricao"
        disabled
        min-height=""
        class="!p-0 !bg-transparent !border-none pointer-events-none"
      />
    </div>

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
      <div v-if="questao.tipo === TipoQuestaoEnum.OBJETIVA" class="space-y-2">
        <div
          v-for="alt in questao.alternativas"
          :key="alt.id"
          class="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
          :class="
            objectiveAnswer === alt.id
              ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
              : 'border-gray-200'
          "
          @click="handleObjectiveSelection(alt.id)"
        >
          <div class="mt-1 mr-3 shrink-0">
            <Icon
              :name="
                objectiveAnswer === alt.id
                  ? 'i-lucide-circle-dot'
                  : 'i-lucide-circle'
              "
              class="w-5 h-5 transition-colors"
              :class="
                objectiveAnswer === alt.id
                  ? 'text-primary-600'
                  : 'text-gray-400'
              "
            />
          </div>
          <div class="flex-1 min-w-0">
            <RichTextEditor
              :model-value="alt.descricao"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div
        v-else-if="questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA"
        class="space-y-2"
      >
        <div
          v-for="alt in questao.alternativas"
          :key="alt.id"
          class="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
          :class="
            multipleChoiceAnswer.includes(alt.id)
              ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
              : 'border-gray-200'
          "
          @click="toggleMultipleChoice(alt.id)"
        >
          <div class="mt-1 mr-3 shrink-0">
            <Icon
              :name="
                multipleChoiceAnswer.includes(alt.id)
                  ? 'i-lucide-check-square'
                  : 'i-lucide-square'
              "
              class="w-5 h-5 transition-colors"
              :class="
                multipleChoiceAnswer.includes(alt.id)
                  ? 'text-primary-600'
                  : 'text-gray-400'
              "
            />
          </div>
          <div class="flex-1 min-w-0">
            <RichTextEditor
              :model-value="alt.descricao"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div
        v-else-if="questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO"
        class="space-y-3"
      >
        <div
          v-for="alt in questao.alternativas"
          :key="alt.id"
          class="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-1 mr-4 min-w-0">
            <RichTextEditor
              :model-value="alt.descricao"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none"
            />
          </div>
          <div class="flex items-center space-x-2 shrink-0 mt-1">
            <UButton
              label="V"
              :variant="trueFalseAnswers[alt.id!] === true ? 'solid' : 'outline'"
              color="secondary"
              size="sm"
              @click="handleTrueFalseSelection(alt.id!, true)"
            />
            <UButton
              label="F"
              :variant="trueFalseAnswers[alt.id!] === false ? 'solid' : 'outline'"
              color="error"
              size="sm"
              @click="handleTrueFalseSelection(alt.id!, false)"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
:deep(.prose p) {
  margin: 0;
}
</style>
