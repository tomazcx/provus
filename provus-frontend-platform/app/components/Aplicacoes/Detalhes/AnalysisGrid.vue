<script setup lang="ts">
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

defineProps<{
  aplicacao: IAplicacao;
  modelo: IAvaliacaoImpl;
}>();

const emit = defineEmits(["view-config"]);
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    <UCard class="lg:col-span-2">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">
          Distribuição de Notas
        </h3>
      </template>
      <div class="h-48 flex items-center justify-center text-gray-400">
        Placeholder para o Gráfico
      </div>
    </UCard>

    <UCard class="flex flex-col">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">
          Estatísticas de Notas
        </h3>
      </template>
      <div class="space-y-4 text-sm flex-1">
        <div class="flex justify-between">
          <span class="text-gray-600">Maior Nota</span>
          <span class="font-bold text-secondary"
            >{{ aplicacao.maiorNota }} / {{ modelo.pontuacao }}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Menor Nota</span>
          <span class="font-bold text-red-600"
            >{{ aplicacao.menorNota }} / {{ modelo.pontuacao }}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Nota Média</span>
          <span class="font-bold text-primary"
            >{{ aplicacao.notaMedia }}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Desvio padrão</span>
          <span class="font-bold text-primary"
            >{{ aplicacao.desvioPadrao }}</span
          >
        </div>
      </div>

      <template #footer>
        <UButton
          block
          variant="soft"
          icon="i-lucide-settings-2"
          @click="emit('view-config')"
        >
          Ver Configuração Completa
        </UButton>
      </template>
    </UCard>
  </div>
</template>
