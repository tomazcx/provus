<script setup lang="ts">
import type { IAvaliacaoImpl } from '~/types/IAvaliacao';
import type { IQuestao } from '~/types/IQuestao';


const props = defineProps<{
  prova: IAvaliacaoImpl;
}>();

const totalPontos = computed(() => {
  if (!props.prova || !props.prova.questoes) return 0;
  return props.prova.questoes.reduce(
    (soma: number, q: IQuestao) => soma + (Number(q.pontuacao) || 0),
    0
  );
});

const contagemTipos = computed(() => {
  if (!props.prova || !props.prova.questoes) return {};
  const contagem: { [key: string]: number } = {};
  for (const questao of props.prova.questoes) {
    const tipoLabel = questao.tipo;
    contagem[tipoLabel] = (contagem[tipoLabel] || 0) + 1;
  }
  return contagem;
});
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Resumo da Prova</h3>
    </template>
    <div class="space-y-4">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Questões</span>
        <span class="font-medium">{{ prova.questoes.length }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Pontos Totais</span>
        <span class="font-medium">{{ totalPontos }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Duração</span>
        <span class="font-medium">{{ prova.configuracoes.tempoMaximo }} minutos</span>
      </div>

      <div class="space-y-2">
        <div
          v-for="(cont, tipo) in contagemTipos"
          :key="tipo"
          class="flex justify-between text-sm"
        >
          <span class="text-gray-600">{{ tipo }}</span>
          <span>{{ cont }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
