<script setup lang="ts">
import CreateFolderDialog from "@/components/BancoDeQuestoes/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";
import type { IFolder } from "~/types/IBank";
import type { IQuestao, TQuestionForm } from "~/types/IQuestao";
import QuestionBankContent from "@/components/BancoDeQuestoes/QuestionBankContent/index.vue";
import { useQuestionBankStore } from "~/store/questionBankstore";

const questionBankStore = useQuestionBankStore();

const showCreateFolder = ref(false);
const showCreateQuestion = ref(false);
const contentCurrentPath = ref("/");

onMounted(() => {
  questionBankStore.fetchItems();
});

function handleCreateFolder(data: { titulo: string }) {
  questionBankStore.createFolder({
    titulo: data.titulo,
    path: contentCurrentPath.value,
  });

  showCreateFolder.value = false;
}

function handleCreateQuestion(formData: TQuestionForm) {
  questionBankStore.createQuestion({
    formData,
    path: contentCurrentPath.value,
  });

  showCreateQuestion.value = false;
}

function handleUpdateItem(payload: {
  item: IFolder | IQuestao;
  newTitle?: string;
  updatedData?: TQuestionForm;
}) {
  questionBankStore.updateItem(payload);
}

function handleDeleteItem(itemToDelete: IFolder | IQuestao) {
  questionBankStore.deleteItem(itemToDelete);
}

const pageTitle = "Banco de Questões";

const currentPathLabel = computed(() => {
  if (contentCurrentPath.value === "/") {
    return "Banco de Questões";
  }
  const segments = contentCurrentPath.value.substring(1).split("/");
  return ["Banco de Questões", ...segments].join(" > ");
});
</script>

<template>
  <div>
    <CreateFolderDialog
      v-model="showCreateFolder"
      :current-path-label="currentPathLabel"
      @create="handleCreateFolder"
    />
    <CreateQuestionDialog
      v-model="showCreateQuestion"
      @create="handleCreateQuestion"
    />

    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
      <div>
        <h1 class="text-3xl font-bold text-primary">{{ pageTitle }}</h1>
        <p class="text-gray-600 mt-1">
          Organize e gerencie seu banco de questões
        </p>
      </div>
      <div class="mt-4 sm:mt-0 space-x-3">
        <UButton icon="i-lucide-folder-plus" @click="showCreateFolder = true">
          Nova pasta
        </UButton>
        <UButton
          color="secondary"
          icon="i-lucide-plus"
          @click="showCreateQuestion = true"
        >
          Nova questão
        </UButton>
      </div>
    </div>

    <QuestionBankContent
      :items="questionBankStore.items"
      @path-changed="(newPath) => (contentCurrentPath = newPath)"
      @update:item="handleUpdateItem"
      @delete:item="handleDeleteItem"
    />
  </div>
</template>
