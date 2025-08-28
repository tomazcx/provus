<script setup lang="ts">
import { onMounted, ref } from "vue";
import QuestionBankContent from "@/components/BancoDeQuestoes/QuestionBankContent/index.vue";
import type { IQuestao } from "~/types/IQuestao";
import { useQuestionBankStore } from "~/store/questionBankstore";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "add-questions",
    payload: {
      questions: IQuestao[];
      rawSelection: { folders: number[]; questions: number[] };
    }
  ): void;
}>();

const questionBankStore = useQuestionBankStore();
const questionContentRef = ref<InstanceType<typeof QuestionBankContent> | null>(
  null
);

onMounted(() => {
  questionBankStore.initialize();
});

async function addSelectedQuestions() {
  const selection = questionContentRef.value?.selectedItems;
  if (
    !selection ||
    (selection.folders.size === 0 && selection.questions.size === 0)
  ) {
    emit("update:modelValue", false);
    return;
  }

  const questionIdsFromFolders =
    await questionBankStore.fetchAllQuestionIdsInFolders(
      Array.from(selection.folders)
    );

  const allQuestionIds = new Set([
    ...Array.from(selection.questions),
    ...questionIdsFromFolders,
  ]);

  const questionsToAdd = await questionBankStore.fetchQuestionsByIds(
    Array.from(allQuestionIds)
  );

  emit("add-questions", {
    questions: questionsToAdd,
    rawSelection: {
      folders: Array.from(selection.folders),
      questions: Array.from(selection.questions),
    },
  });

  emit("update:modelValue", false);
}
</script>
<template>
  <UModal
    :open="modelValue"
    title="Banco de questões"
    description="Selecione as questões ou pastas que deseja adicionar à avaliação"
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
          <Icon name="i-lucide-plus" class="mr-2" /> Adicionar itens
        </UButton>
        <UButton variant="outline" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
