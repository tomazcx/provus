<script setup lang="ts">
import AssessmentQuestionItem from "@/components/Avaliacao/AssessmentQuestionItem/index.vue";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";

const questoes = defineModel<QuestaoEntity[]>("questoes", { required: true });

defineProps<{
  autocorrecaoAtiva?: boolean;
}>();

const emit = defineEmits([
  "adicionar",
  "remover",
  "adicionarDoBanco",
  "save-to-bank",
  "gerar-ia",
]);
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
          @click="emit('adicionarDoBanco')"
        />
        <div class="flex flex-col sm:flex-row gap-3">
          <UButton
            block
            label="Gerar com I.A."
            size="lg"
            variant="soft"
            icon="i-lucide-brain-circuit"
            @click="emit('gerar-ia')"
          />
        </div>
      </div>
    </div>

    <template v-else>
      <draggable
        v-model="questoes"
        item-key="id"
        handle=".drag-handle"
        class="space-y-4"
      >
        <template #item="{ element, index }">
          <AssessmentQuestionItem
            :model-value="element"
            :numero="index + 1"
            :autocorrecao-ativa="autocorrecaoAtiva"
            @update:model-value="questoes[index] = $event"
            @remover="emit('remover', element.id)"
            @save-to-bank="emit('save-to-bank', element)"
          />
        </template>
      </draggable>

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
          @click="emit('adicionarDoBanco')"
        />
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UButton
          block
          label="Gerar com I.A."
          size="lg"
          variant="soft"
          icon="i-lucide-brain-circuit"
          @click="emit('gerar-ia')"
        />
      </div>
    </template>
  </div>
</template>
