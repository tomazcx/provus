<script setup lang="ts">
import QuestionsBankQuestionItem from "~/components/BancoDeQuestoes/QuestionsBankQuestionItem/index.vue";
import type { IQuestao } from "~/types/IQuestao";

defineProps<{
  modelValue: boolean;
  selectedQuestions: IQuestao[];
}>();

const emit = defineEmits([
  "update:modelValue",
  "remove-question",
  "edit-question",
]);

function handleRemove(question: IQuestao) {
  emit("remove-question", question.id);
}

function handleEdit(question: IQuestao) {
  emit("edit-question", question);
}
</script>

<template>
  <UModal
    :open="modelValue"
    title="Questões selecionadas"
    description="Veja o grupo de questões que foram selecionadas para participarem da randomização."
    class="min-w-3xl"
    @update:open="emit('update:modelValue', $event)"
  >
    <template #body>
      <div class="max-h-96 overflow-y-auto">
        <p v-if="selectedQuestions.length === 0" class="text-sm text-gray-500">
          Nenhuma questão selecionada.
        </p>
        <div v-else class="space-y-2">
          <QuestionsBankQuestionItem
            v-for="question in selectedQuestions"
            :key="question.id"
            :item="question"
            @delete="handleRemove(question)"
            @edit="handleEdit(question)"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-3">
        <UButton
          color="primary"
          variant="ghost"
          @click="emit('update:modelValue', false)"
        >
          Fechar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
