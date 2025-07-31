<script setup lang="ts">
import QuestionBankContent from "@/components/BancoDeQuestoes/QuestionBankContent/index.vue";
import type { IQuestao } from "~/types/IQuestao";
import isFolder from "~/guards/isFolder";
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

onMounted(() => {
  questionBankStore.fetchItems();
});

const questionContentRef = ref<InstanceType<typeof QuestionBankContent> | null>(
  null
);

function addSelectedQuestions() {
  const selection = questionContentRef.value?.selectedItems;
  if (
    !selection ||
    (selection.folders.size === 0 && selection.questions.size === 0)
  ) {
    emit("update:modelValue", false);
    return;
  }

  const finalQuestionIds = new Set<number>(selection.questions);

  selection.folders.forEach((folderId: number) => {
    const folder = questionBankStore.items.find((i) => i.id === folderId);
    if (folder && isFolder(folder)) {
      const pathPrefix =
        folder.path === "/"
          ? `/${folder.titulo}`
          : `${folder.path}/${folder.titulo}`;

      questionBankStore.items.forEach((item) => {
        if (item.path?.startsWith(pathPrefix) && !isFolder(item)) {
          finalQuestionIds.add(item.id!);
        }
      });
    }
  });

  const questionsToAdd = questionBankStore.items.filter(
    (item) => item.id && finalQuestionIds.has(item.id)
  ) as IQuestao[];

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
