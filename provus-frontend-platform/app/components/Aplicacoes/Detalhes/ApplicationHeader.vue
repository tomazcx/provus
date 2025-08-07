<script setup lang="ts">
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

const props = defineProps<{
  aplicacao: IAplicacao;
  modelo: IAvaliacaoImpl;
}>();

const dataAplicacaoFormatada = computed(() => {
  return new Date(props.aplicacao.dataAplicacao).toLocaleDateString("pt-BR");
});

const horaAplicacaoFormatada = computed(() => {
  return new Date(props.aplicacao.dataAplicacao).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <div
          class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-file-text" class="text-blue-600 text-2xl" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ aplicacao.titulo }}
          </h1>
          <p>{{ modelo.descricao }}</p>
        </div>
      </div>
      <div class="text-gray-600 flex gap-4">
        <p class="text-gray-600 flex items-center gap-1">
          <Icon name="i-lucide-calendar-days" />
          {{ dataAplicacaoFormatada }}
        </p>
        <p class="text-gray-600 flex items-center gap-1">
          <Icon name="i-lucide-clock" />
          {{ horaAplicacaoFormatada }}
        </p>
      </div>
    </div>
    <div class="bg-green-100 border border-green-200 rounded-lg px-4 py-3">
      <div class="flex items-center space-x-2">
        <Icon name="i-lucide-check-circle" class="text-green-600" />
        <span class="font-medium text-green-800">{{ aplicacao.estado }}</span>
        <span class="text-green-600"
          >• {{ aplicacao.participantes }} participantes</span
        >
      </div>
    </div>
  </div>
</template>
