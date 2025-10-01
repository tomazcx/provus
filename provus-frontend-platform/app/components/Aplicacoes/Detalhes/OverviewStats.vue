<script setup lang="ts">
import type { IAplicacao } from "~/types/IAplicacao";

defineProps<{
  aplicacao: IAplicacao;
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Total de Participantes</p>
          <p class="text-3xl font-bold text-gray-900">
            {{ aplicacao.participantes }}
          </p>
        </div>
      </div>
    </UCard>
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Média Geral</p>
          <p class="text-3xl font-bold text-secondary">
            {{ aplicacao.mediaGeral }}%
          </p>
        </div>
      </div>
    </UCard>
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Taxa de conclusão</p>
          <p class="text-3xl font-bold">{{ aplicacao.taxaDeConclusao }}%</p>
        </div>
      </div>
    </UCard>
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">Tempo médio de submissão</p>
          <p class="text-3xl font-bold">{{ aplicacao.tempoMedio }}m</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
