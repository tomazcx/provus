<script setup lang="ts">
import QuestionsBankFolderItem from "~/components/BancoDeQuestoes/QuestionsBankFolderItem/index.vue";
import QuestionsBankQuestionItem from "~/components/BancoDeQuestoes/QuestionsBankQuestionItem/index.vue";
import type { IQuestao, TQuestionForm } from "~/types/IQuestao";
import EditQuestionDialog from "@/components/BancoDeQuestoes/EditQuestionDialog/index.vue";
import EditFolderDialog from "@/components/BancoDeQuestoes/EditFolderDialog/index.vue";
import CreateFolderDialog from "@/components/BancoDeQuestoes/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";
import isFolder from "~/guards/isFolder";
import { useQuestionBankStore } from "~/store/questionBankstore";
import type { IFolder } from "~/types/IBank";

const props = defineProps({
  mode: {
    type: String as () => "browse" | "select",
    default: "browse",
  },
});
const emit = defineEmits(["path-changed"]);

const questionBankStore = useQuestionBankStore();
const showCreateFolder = ref(false);
const showCreateQuestion = ref(false);
const editingQuestion = ref<IQuestao | null>(null);
const editingFolder = ref<IFolder | null>(null);
const internalCurrentPath = ref("/");
const selectedItems = ref({
  folders: new Set<number>(),
  questions: new Set<number>(),
});

function handleItemClick(item: IFolder | IQuestao) {
  if (isFolder(item)) {
    const newPath =
      internalCurrentPath.value === "/"
        ? `/${item.titulo}`
        : `${internalCurrentPath.value}/${item.titulo}`;
    internalCurrentPath.value = newPath;
  } else if (props.mode === "select" && item.id) {
    handleSelectItem(item);
  }
}

function handleSelectItem(item: IFolder | IQuestao) {
  const targetSet = isFolder(item)
    ? selectedItems.value.folders
    : selectedItems.value.questions;
  const isSelected = targetSet.has(item.id!);

  if (isSelected) {
    targetSet.delete(item.id!);
  } else {
    targetSet.add(item.id!);
  }
}

watch(internalCurrentPath, (newPath) => {
  emit("path-changed", newPath);
});

function handleCreateFolder(data: { titulo: string }) {
  questionBankStore.createFolder({
    titulo: data.titulo,
    path: internalCurrentPath.value,
  });
  showCreateFolder.value = false;
}

function handleCreateQuestion(formData: TQuestionForm) {
  questionBankStore.createQuestion({
    formData,
    path: internalCurrentPath.value,
  });
  showCreateQuestion.value = false;
}

function handleUpdateFolder({ newTitle }: { newTitle: string }) {
  if (!editingFolder.value) return;
  questionBankStore.updateItem({ item: editingFolder.value, newTitle });
  editingFolder.value = null;
}

function handleUpdateQuestion(updatedData: TQuestionForm) {
  if (!editingQuestion.value) return;
  questionBankStore.updateItem({ item: editingQuestion.value, updatedData });
  editingQuestion.value = null;
}

function handleDelete(itemToDelete: IFolder | IQuestao) {
  questionBankStore.deleteItem(itemToDelete);
}

const pathSegments = computed(() => {
  if (internalCurrentPath.value === "/") return [];
  return internalCurrentPath.value.substring(1).split("/");
});

const currentPath = computed(() => {
  if (pathSegments.value.length === 0) return "/";
  return `/${pathSegments.value.join("/")}`;
});

const breadcrumbs = computed(() => {
  const crumbs = [{ label: "Banco de Questões", to: "/banco-de-questoes" }];
  const currentCrumbPath: string[] = [];
  for (const segment of pathSegments.value) {
    currentCrumbPath.push(segment);
    crumbs.push({
      label: segment,
      to: `/banco-de-questoes/${currentCrumbPath.join("/")}`,
    });
  }
  return crumbs;
});

const currentPathLabel = computed(() => {
  return breadcrumbs.value.map((crumb) => crumb.label).join(" > ");
});

const itemsInCurrentFolder = computed(() =>
  questionBankStore.items
    .filter((item) => item.path === currentPath.value)
    .sort((a, b) => {
      const aIsFolder = isFolder(a);
      const bIsFolder = isFolder(b);
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      const dateA = new Date(a.atualizadoEm ?? 0).getTime();
      const dateB = new Date(b.atualizadoEm ?? 0).getTime();
      return dateB - dateA;
    })
);

function getChildCount(folder: IFolder): number {
  const childPath =
    folder.path === "/"
      ? `/${folder.titulo}`
      : `${folder.path}/${folder.titulo}`;
  return questionBankStore.items.filter((item) => item.path === childPath)
    .length;
}

function navigateFromBreadcrumb(path: string) {
  if (path === "/banco-de-questoes") {
    internalCurrentPath.value = "/";
  } else {
    internalCurrentPath.value = path.replace("/banco-de-questoes", "");
  }
}

function handleEdit(item: IFolder | IQuestao) {
  if (isFolder(item)) {
    editingFolder.value = item;
  } else {
    editingQuestion.value = item;
  }
}

const filters = reactive({
  search: "",
  type: "Todos os tipos",
  sort: "Última modificação",
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
    <EditQuestionDialog
      :model-value="!!editingQuestion"
      :question="editingQuestion"
      @update:model-value="editingQuestion = null"
      @update:question="handleUpdateQuestion"
    />
    <EditFolderDialog
      :model-value="!!editingFolder"
      :folder="editingFolder"
      @update:model-value="editingFolder = null"
      @update="handleUpdateFolder"
    />

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

    <div v-if="pathSegments.length > 0" class="mb-6">
      <UBreadcrumb :items="breadcrumbs">
        <template #item="{ item }">
          <span
            class="cursor-pointer hover:underline"
            @click.prevent="navigateFromBreadcrumb(item.to)"
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
        v-if="itemsInCurrentFolder.length === 0"
        class="text-center text-gray-500 py-10"
      >
        Esta pasta está vazia.
      </div>
      <div
        v-for="item in itemsInCurrentFolder"
        v-else
        :key="item.id"
        :class="{
          'cursor-pointer hover:bg-gray-50':
            isFolder(item) || mode === 'select',
        }"
        @click.prevent="handleItemClick(item)"
      >
        <QuestionsBankFolderItem
          v-if="isFolder(item)"
          :item="item"
          :selectable="mode === 'select'"
          :is-selected="selectedItems.folders.has(item.id!)"
          :child-count="getChildCount(item)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
        <QuestionsBankQuestionItem
          v-else
          :item="item"
          :is-selected="selectedItems.questions.has(item.id!)"
          @select="handleSelectItem(item)"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
        />
      </div>
    </div>
  </div>
</template>
