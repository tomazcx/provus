<script setup lang="ts">
import CreateFolderDialog from "@/components/BancoDeQuestoes/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";
import QuestionsBankFolderItem from "~/components/BancoDeQuestoes/QuestionsBankFolderItem/index.vue";
import QuestionsBankQuestionItem from "~/components/BancoDeQuestoes/QuestionsBankQuestionItem/index.vue";
import type { IFolder } from "~/types/IBank";
import { mockQuestionBankResponse } from "~/mock/mockQuestionBankResponse";
import isFolder from "~/guards/isFolder";
import type { IQuestao, TQuestionForm } from "~/types/IQuestao";

const route = useRoute();

const filters = reactive({
  search: "",
  type: "Todos os tipos",
  sort: "Última modificação",
});

const showCreateFolder = ref(false);
const showCreateQuestion = ref(false);

const questionBankItems = ref(mockQuestionBankResponse);

const pathSegments = computed(
  () => (route.params.folderPath as string[]) || []
);

const currentPath = computed(() => {
  if (pathSegments.value.length === 0) {
    return "/";
  }
  return `/${pathSegments.value.join("/")}`;
});

const itemsInCurrentFolder = computed(() =>
  questionBankItems.value
    .filter((item) => item.path === currentPath.value)
    .sort((a, b) => {
      const aIsFolder = isFolder(a);
      const bIsFolder = isFolder(b);

      if (aIsFolder && !bIsFolder) {
        return -1;
      }
      if (!aIsFolder && bIsFolder) {
        return 1;
      }

      const dateA = new Date(a.atualizadoEm ?? 0).getTime();
      const dateB = new Date(b.atualizadoEm ?? 0).getTime();

      return dateB - dateA;
    })
);

function onItemClick(item: IFolder | IQuestao) {
  if (isFolder(item)) {
    navigateTo(
      `/banco-de-questoes/${[...pathSegments.value, item.titulo].join("/")}`
    );
  }
}

function handleCreateFolder(data: { titulo: string }) {
  const newFolder: IFolder = {
    id: Math.max(...questionBankItems.value.map((i) => i.id ?? 0)) + 1,
    titulo: data.titulo,
    path: currentPath.value,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    filhos: [],
  };
  questionBankItems.value.push(newFolder);
}

function getChildCount(folder: IFolder): number {
  const childPath =
    folder.path === "/"
      ? `/${folder.titulo}`
      : `${folder.path}/${folder.titulo}`;

  return questionBankItems.value.filter((item) => item.path === childPath)
    .length;
}

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

const pageTitle = computed(() => {
  if (breadcrumbs.value.length > 1) {
    return (
      breadcrumbs.value[breadcrumbs.value.length - 1]?.label ??
      "Banco de Questões"
    );
  }
  return "Banco de Questões";
});

function handleCreateQuestion(formData: TQuestionForm) {
  const newQuestion: IQuestao = {
    ...formData,
    path: currentPath.value,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  questionBankItems.value.push(newQuestion);
}
</script>

<template>
  <div>
    <CreateFolderDialog
      v-model="showCreateFolder"
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
        <p v-if="pageTitle === 'Banco de Questões'" class="text-gray-600 mt-1">
          Organize e gerencie seu banco de questões
        </p>
      </div>
      <div class="mt-4 sm:mt-0 space-x-3">
        <UButton
          variant="solid"
          color="primary"
          icon="i-lucide-folder-plus"
          @click="showCreateFolder = true"
        >
          Nova pasta
        </UButton>
        <UButton
          variant="solid"
          color="secondary"
          icon="i-lucide-plus"
          @click="showCreateQuestion = true"
        >
          Nova questão
        </UButton>
      </div>
    </div>

    <UBreadcrumb
      v-if="pathSegments.length > 0"
      :items="breadcrumbs"
      class="mb-6"
    />

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
          'cursor-pointer hover:bg-gray-50 rounded-lg': isFolder(item),
        }"
        @click="onItemClick(item)"
      >
        <QuestionsBankFolderItem
          v-if="isFolder(item)"
          :item="item as IFolder"
          :child-count="getChildCount(item)"
        />
        <QuestionsBankQuestionItem v-else :item="item as IQuestao" />
      </div>
    </div>
  </div>
</template>
