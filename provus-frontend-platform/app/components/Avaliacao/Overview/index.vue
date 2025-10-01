<script setup lang="ts">
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";

const props = defineProps<{
  prova: AvaliacaoEntity | null;
}>();

const totalPontos = computed(() => {
  if (!props.prova || !props.prova.questoes) return 0;
  return props.prova.questoes.reduce(
    (soma: number, q: QuestaoEntity) => soma + (Number(q.pontuacao) || 0),
    0
  );
});

const contagemTipos = computed(() => {
  if (!props.prova || !props.prova.questoes) return {};
  const contagem: { [key: string]: number } = {};
  for (const questao of props.prova.questoes) {
    const tipoLabel = questao.tipoQuestao;
    contagem[tipoLabel] = (contagem[tipoLabel] || 0) + 1;
  }
  return contagem;
});
</script>

<template>
  <UCard v-if="prova">
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
        <span class="font-medium"
          >{{
            prova.configuracao.configuracoesGerais.tempoMaximo
          }}
          minutos</span
        >
      </div>

      <div
        v-if="Object.keys(contagemTipos).length > 0"
        class="space-y-2 pt-4 border-t border-gray-200"
      >
        <div
          v-for="(cont, tipo) in contagemTipos"
          :key="tipo"
          class="flex justify-between text-sm"
        >
          <span class="text-gray-600">{{ tipo }}</span>
          <span class="font-medium">{{ cont }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
