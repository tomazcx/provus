<script setup lang="ts">
import CreateFolderDialog from "@/components/BancoDeQuestoes/CreateFolderDialog/index.vue";
import CreateQuestionDialog from "@/components/BancoDeQuestoes/CreateQuestionDialog/index.vue";
import { mockQuestionBankResponse } from "~/mock/mockQuestionBankResponse";
import type { IFolder } from "~/types/IBank";
import type { IQuestao } from "~/types/IQuestao";
import isFolder from "~/guards/isFolder";

const filters = reactive({
  search: "",
  type: "Todos os tipos",
  sort: "Última modificação",
});

const questionBankItems = reactive<(IFolder | IQuestao)[]>(
  mockQuestionBankResponse
);

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

    <!-- <UBreadcrumb
      class="mb-6"
      :items="[
        { label: 'Question Bank', to: '/banco-de-questoes' },

        { label: 'Math', to: '/home' },

        { label: 'High School', to: '/home' },
      ]"
    /> -->

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

    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-gray-600"
        >{{ questionBankItems.length }} itens</span
      >

      <div>
        <UButton variant="link" size="sm">Selecione tudo</UButton>

        <UButton variant="link" size="sm" color="error">
          Excluir selecionados
        </UButton>
      </div>
    </div>

    <div class="space-y-4">
      <component
        :is="isFolder(item) ? FolderItem : QuestionItem"
        v-for="item in questionBankItems"
        :key="isFolder(item) ? item.id : item.id"
        :item="item"
      />
    </div>
  </div>
</template>
