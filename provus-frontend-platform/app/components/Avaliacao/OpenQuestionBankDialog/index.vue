<script setup lang="ts">
import { ref, onMounted } from "vue";
import QuestionBankContent from "@/components/BancoDeQuestoes/QuestionBankContent/index.vue";
import type { IQuestao } from "~/types/IQuestao";
import { useQuestionBankStore } from "~/store/questionBankstore";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "add-questions", payload: IQuestao[]): void;
}>();

const questionBankStore = useQuestionBankStore();

onMounted(() => {
  questionBankStore.fetchItems();
});

const questionContentRef = ref<InstanceType<typeof QuestionBankContent> | null>(
  null
);

function addSelectedQuestions() {
  const selectedIds = questionContentRef.value?.selectedQuestionIds;
  if (!selectedIds || selectedIds.size === 0) {
    emit("update:modelValue", false);
    return;
  }

  const questionsToAdd = questionBankStore.items.filter(
    (item) => item.id && selectedIds.has(item.id)
  ) as IQuestao[];

  emit("add-questions", questionsToAdd);
  emit("update:modelValue", false);
}
</script>

<template>
  <UModal
    :open="modelValue"
    title="Banco de questões"
    description="Selecione as questões que deseja adicionar à avaliação"
    class="min-w-6xl"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <QuestionBankContent
        ref="questionContentRef"
        mode="select"
        :items="questionBankStore.items"
      />
    </template>

    <template #footer>
      <div class="flex flex-row-reverse gap-4 w-full">
        <UButton variant="solid" color="primary" @click="addSelectedQuestions">
          <Icon name="i-lucide-plus" class="mr-2" /> Adicionar questões
        </UButton>
        <UButton variant="outline" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
