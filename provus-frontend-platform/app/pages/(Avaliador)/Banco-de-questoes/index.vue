<script setup lang="ts">
import CreateFolderDialog from "@/components/BancoDeQuestoes/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";
import type { TBankItem } from "@/types/QuestionBank";

const filters = reactive({
  search: "",
  type: "All Types",
  sort: "Last Modified",
});

const questionBankItems = reactive<TBankItem[]>([
  {
    type: "folder",
    id: "folder1",
    titulo: "Algebra",
    contagem: 15,
    modificadoEm: "2 days ago",
  },
  {
    type: "folder",
    id: "folder2",
    titulo: "Geometry",
    contagem: 23,
    modificadoEm: "1 week ago",
  },
  {
    type: "question",
    data: {
      id: 101,
      titulo: "Quadratic Equations - Finding Roots",
      descricao: "Solve for x in x² + 5x + 6 = 0...",
      tipo: { label: "Múltipla Escolha", value: "multipla-escolha" },
      materia: "Mathematics",
      atualizadoEm: new Date(),
      opcoes: [],
    },
  },
  {
    type: "question",
    data: {
      id: 102,
      titulo: "Properties of Real Numbers",
      descricao: "The commutative property applies to...",
      tipo: { label: "Verdadeiro ou Falso", value: "verdadeiro-falso" },
      materia: "Mathematics",
      atualizadoEm: new Date(),
      opcoes: [],
    },
  },
]);

const QuestionItem = resolveComponent("QuestionsBankQuestionItem");
const FolderItem = resolveComponent("QuestionsBankFolderItem");

const showCreateFolder = ref(false);
const showCreateQuestion = ref(false);
</script>

<template>
  <div>
    <CreateFolderDialog v-model="showCreateFolder" />

    <CreateQuestionDialog v-model="showCreateQuestion" />

    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
      <div>
        <h1 class="text-3xl font-bold text-primary">Banco de questões</h1>

        <p class="text-gray-600 mt-1">
          Organize and gerencie seu banco de questões
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
      class="mb-6"
      :items="[
        { label: 'Question Bank', to: '/banco-de-questoes' },

        { label: 'Math', to: '/home' },

        { label: 'High School', to: '/home' },
      ]"
    />

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div class="flex gap-4 w-full">
        <UFormField label="Search Questions" class="w-full">
          <UInput
            v-model="filters.search"
            placeholder="Search by title or content..."
            icon="i-lucide-search"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Question Type" class="w-full">
          <USelect
            v-model="filters.type"
            :items="[
              'All Types',

              'Multiple Choice',

              'Single Choice',

              'True/False',

              'Text Answer',

              'Essay',
            ]"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Sort By" class="w-full">
          <USelect
            v-model="filters.sort"
            :items="[
              'Last Modified',

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

    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-gray-600"
        >{{ questionBankItems.length }} items</span
      >

      <div>
        <UButton variant="link" size="sm">Select All</UButton>

        <UButton variant="link" size="sm" color="error">
          Delete Selected
        </UButton>
      </div>
    </div>

    <div class="space-y-4">
      <component
        :is="item.type === 'folder' ? FolderItem : QuestionItem"
        v-for="item in questionBankItems"
        :key="item.type === 'folder' ? item.id : item.data.id"
        :item="item"
      />
    </div>
  </div>
</template>
