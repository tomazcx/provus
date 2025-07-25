<script setup lang="ts">
import AssessmentQuestionItem from "@/components/Avaliacao/AssessmentQuestionItem/index.vue";
import type { IQuestao } from "~/types/IQuestao";

const questoes = defineModel<IQuestao[]>("questoes", { required: true });
const emit = defineEmits(["adicionar", "remover"]);
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="questoes?.length === 0"
      class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
    >
      <div
        class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <UIcon
          name="i-heroicons-question-mark-circle"
          class="text-gray-400 text-3xl"
        />
      </div>
      <h3 class="text-lg font-medium text-gray-600 mb-2">
        Nenhuma questão adicionada ainda
      </h3>
      <p class="text-gray-500 mb-4">
        Comece a montar sua prova adicionando questões
      </p>

      <div class="flex justify-center gap-3">
        <UButton
          label="Adicionar Nova Questão"
          size="lg"
          variant="solid"
          color="secondary"
          icon="i-heroicons-plus"
          @click="emit('adicionar')"
        />
        <UButton
          label="Adicionar do Banco de Questões"
          size="lg"
          icon="i-heroicons-circle-stack"
        />
      </div>
    </div>

    <template v-else>
      <template v-for="(questao, index) in questoes" :key="questao.descricao">
        <AssessmentQuestionItem
          v-if="questao"
          v-model="questoes[index]!"
          :numero="index + 1"
          @remover="emit('remover', questao.descricao)"
        />
      </template>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          block
          label="Adicionar Nova Questão"
          size="lg"
          variant="solid"
          icon="i-heroicons-plus"
          @click="emit('adicionar')"
        />
        <UButton
          block
          label="Adicionar do Banco de Questões"
          size="lg"
          icon="i-heroicons-circle-stack"
          color="secondary"
        />
      </div>
    </template>
  </div>
</template>
