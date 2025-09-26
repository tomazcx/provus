<script setup lang="ts">
import QuestionsBankFolderItem from "~/components/BancoDeQuestoes/QuestionsBankFolderItem/index.vue";
import QuestionsBankQuestionItem from "~/components/BancoDeQuestoes/QuestionsBankQuestionItem/index.vue";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";
import EditFolderDialog from "@/components/ui/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/ui/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";

import { useQuestionBankStore } from "~/store/questionBankstore";
import type {
  CreateQuestaoRequest,
  UpdateQuestaoRequest,
} from "~/types/api/request/Questao.request";
import type { FolderEntity } from "~/types/entities/Item.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import TipoItemEnum from "~/enums/TipoItemEnum";

function isFolder(item: QuestaoEntity | FolderEntity): item is FolderEntity {
  return item.tipo === TipoItemEnum.PASTA;
}

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});

const questionBankStore = useQuestionBankStore();

onMounted(() => {
  questionBankStore.initialize();
});

const showCreateFolder = ref(false);
const showCreateQuestion = ref(false);
const editingItem = ref<QuestaoEntity | FolderEntity | null>(null);
const selectedItems = ref({
  folders: new Set<number>(),
  questions: new Set<number>(),
});
const filters = reactive({
  search: "",
  type: "Todos os tipos",
  sort: "Última modificação",
});

function handleItemClick(item: QuestaoEntity | FolderEntity) {
  if (isFolder(item)) {
    questionBankStore.navigateToFolder(item);
  } else if (props.mode === "select") {
    handleSelectItem(item);
  }
}

function handleSelectItem(item: QuestaoEntity | FolderEntity) {
  if (!item.id) return;
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.questions;

  if (targetSet.has(item.id)) {
    targetSet.delete(item.id);
  } else {
    targetSet.add(item.id);
  }
}

function handleCreateFolder(data: { titulo: string }) {
  questionBankStore.createFolder(data);
  showCreateFolder.value = false;
}

function handleCreateQuestion(formData: CreateQuestaoRequest) {
  questionBankStore.createQuestion(formData);
  showCreateQuestion.value = false;
}

function handleUpdate(
  updatedData: { newTitle: string } | UpdateQuestaoRequest
) {
  if (!editingItem.value) return;

  const dataToSend =
    "newTitle" in updatedData ? { titulo: updatedData.newTitle } : updatedData;

  questionBankStore.updateItem(editingItem.value, dataToSend);
  editingItem.value = null;
}

function handleDelete(itemToDelete: QuestaoEntity | FolderEntity) {
  questionBankStore.deleteItem(itemToDelete);
}

const breadcrumbItems = computed(() =>
  questionBankStore.breadcrumbs.map((crumb, index) => ({
    label: crumb.titulo,
    index: index,
  }))
);

const currentPathLabel = computed(() =>
  questionBankStore.breadcrumbs.map((c) => c.titulo).join(" > ")
);

const filteredItems = computed(() => {
  return [...questionBankStore.items].filter((item) =>
    item.titulo.toLowerCase().includes(filters.search.toLowerCase())
  );
});

defineExpose({
  selectedItems,
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

    <template v-if="editingItem">
      <EditFolderDialog
        v-if="isFolder(editingItem)"
        :model-value="true"
        :folder="editingItem"
        @update:model-value="editingItem = null"
        @update="handleUpdate"
      />
      <EditQuestionDialog
        v-else
        :model-value="true"
        :question="editingItem"
        @update:model-value="editingItem = null"
        @update:question="handleUpdate"
      />
    </template>

    <div class="flex justify-end mb-8">
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

    <div v-if="questionBankStore.breadcrumbs.length > 1" class="mb-6">
      <UBreadcrumb :items="breadcrumbItems">
        <template #item="{ item, index }">
          <span
            class="cursor-pointer hover:underline"
            @click.prevent="questionBankStore.navigateToBreadcrumb(index)"
          >
            {{ item.label }}
          </span>
        </template>
      </UBreadcrumb>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div class="flex gap-4 w-full">
        <UFormField label="Buscar" class="w-full">
          <UInput
            v-model="filters.search"
            placeholder="Buscar por título"
            icon="i-lucide-search"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tipo de questão" class="w-full">
          <USelect
            v-model="filters.type"
            :items="[
              'Todos os tipos',
              'Múltipla Escolha',
              'Objetiva',
              'Verdadeiro ou Falso',
              'Discursiva',
            ]"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Ordenar por" class="w-full">
          <USelect
            v-model="filters.sort"
            :items="[
              'Última modificação',
              'Alphabetical A-Z',
              'Alphabetical Z-A',
              'Oldest First',
              'Newest First',
            ]"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-if="filteredItems.length === 0"
        class="text-center text-gray-500 py-10"
      >
        <span v-if="questionBankStore.isLoading">Carregando...</span>
        <span v-else>Esta pasta está vazia.</span>
      </div>
      <div
        v-for="item in filteredItems"
        v-else
        :key="item.id"
        @click.prevent="handleItemClick(item)"
      >
        <QuestionsBankFolderItem
          v-if="isFolder(item)"
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.folders.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="editingItem = item"
          @delete="handleDelete(item)"
        />
        <QuestionsBankQuestionItem
          v-else
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.questions.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="editingItem = item"
          @delete="handleDelete(item)"
        />
      </div>
    </div>
  </div>
</template>
