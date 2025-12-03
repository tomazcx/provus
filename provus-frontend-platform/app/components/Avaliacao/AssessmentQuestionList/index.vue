<script setup lang="ts">
import AssessmentQuestionItem from "@/components/Avaliacao/AssessmentQuestionItem/index.vue";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { RandomizationRuleEntity } from "~/types/entities/Configuracoes.entity";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import { useAssessmentStore } from "~/store/assessmentStore";

const questoes = defineModel<QuestaoEntity[]>("questoes", { required: true });

const props = defineProps<{
  autocorrecaoAtiva?: boolean;
  randomizationRules?: RandomizationRuleEntity[];
}>();

const emit = defineEmits([
  "adicionar",
  "remover",
  "adicionarDoBanco",
  "save-to-bank",
  "gerar-ia",
]);

const assessmentStore = useAssessmentStore();

const isDynamicRandomization = computed(() => {
  if (!props.randomizationRules || props.randomizationRules.length === 0)
    return false;

  return props.randomizationRules.some(
    (r) =>
      r.tipo === TipoRandomizacaoEnum.BANCO_SIMPLES ||
      r.tipo === TipoRandomizacaoEnum.BANCO_CONFIGURAVEL
  );
});

const totalDynamicQuestions = computed(() => {
  if (!props.randomizationRules) return 0;
  return props.randomizationRules.reduce(
    (acc, r) => acc + (Number(r.quantidade) || 0),
    0
  );
});
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="isDynamicRandomization"
      class="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center"
    >
      <div
        class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <UIcon name="i-lucide-shuffle" class="text-blue-600 text-3xl" />
      </div>
      <h3 class="text-lg font-bold text-blue-800 mb-2">
        Modo de Randomização de Banco Ativo
      </h3>
      <p class="text-blue-600 mb-4 max-w-lg mx-auto">
        Esta avaliação está configurada para selecionar questões dinamicamente
        do banco de questões no momento da aplicação.
      </p>

      <div class="flex justify-center gap-4 text-sm">
        <div
          class="bg-white px-4 py-2 rounded-md border border-blue-100 shadow-sm"
        >
          <span class="block font-bold text-2xl text-blue-700">{{
            totalDynamicQuestions
          }}</span>
          <span class="text-gray-500">Questões a gerar</span>
        </div>
        <div
          class="bg-white px-4 py-2 rounded-md border border-blue-100 shadow-sm"
        >
          <span class="block font-bold text-2xl text-blue-700">{{
            props.randomizationRules?.length || 0
          }}</span>
          <span class="text-gray-500">Regras ativas</span>
        </div>
      </div>

      <p class="text-xs text-gray-500 mt-6">
        Para editar as regras, acesse "Configurações Rápidas" ou o menu de
        configurações completo.
      </p>
    </div>

    <div
      v-else-if="
        (!questoes || questoes.length === 0) &&
        assessmentStore.pendingAiQuestions === 0
      "
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

    <div v-else>
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

      <div v-if="assessmentStore.pendingAiQuestions > 0" class="space-y-4 mt-4">
        <div
          v-for="i in assessmentStore.pendingAiQuestions"
          :key="`skeleton-${i}`"
          class="border border-gray-200 rounded-lg p-6 bg-white animate-pulse space-y-4"
        >
          <div class="flex justify-between">
            <div class="h-6 bg-gray-200 rounded w-1/4" />
            <div class="h-6 bg-gray-200 rounded w-8" />
          </div>
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-4 bg-gray-200 rounded w-1/2" />
          <div class="pt-4 space-y-2">
            <div class="h-10 bg-gray-100 rounded w-full" />
            <div class="h-10 bg-gray-100 rounded w-full" />
          </div>
          <div
            class="flex justify-center items-center text-primary text-sm font-medium pt-2"
          >
            <Icon name="i-lucide-sparkles" class="animate-spin mr-2" />
            Criando questão com Inteligência Artificial...
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mt-4">
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
</template>
