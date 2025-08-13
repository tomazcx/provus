<script setup lang="ts">
import type { ISubmissao } from "~/types/ISubmissao";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";

const props = defineProps<{
  submission: ISubmissao;
}>();

const correctAnswers = computed(() => {
  return props.submission.questoesRespondidas.filter(
    (q) => q.resposta?.estadoCorrecao === EstadoQuestaoCorrigida.CORRETA
  ).length;
});

const partiallyCorrectAnswers = computed(() => {
  return props.submission.questoesRespondidas.filter(
    (q) =>
      q.resposta?.estadoCorrecao === EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA
  ).length;
});

const incorrectAnswers = computed(() => {
  return props.submission.questoesRespondidas.filter(
    (q) =>
      q.resposta?.estadoCorrecao === EstadoQuestaoCorrigida.INCORRETA ||
      q.resposta?.estadoCorrecao === EstadoQuestaoCorrigida.NAO_RESPONDIDA
  ).length;
});

const averageTimePerQuestion = computed(() => {
  if (
    !props.submission.iniciadoEm ||
    !props.submission.finalizadoEm ||
    props.submission.questoesRespondidas.length === 0
  ) {
    return "-";
  }
  const inicio = new Date(props.submission.iniciadoEm);
  const fim = new Date(props.submission.finalizadoEm);
  const diffSegundos = (fim.getTime() - inicio.getTime()) / 1000;
  const tempoMedioSegundos = Math.round(
    diffSegundos / props.submission.questoesRespondidas.length
  );

  const minutos = Math.floor(tempoMedioSegundos / 60);
  const segundos = tempoMedioSegundos % 60;

  if (minutos > 0) {
    return `${minutos}m ${segundos}s`;
  } else {
    return `${segundos}s`;
  }
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <UCard>
      <div class="flex items-center space-x-3">
        <div
          class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-check" class="text-green-600 text-xl" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Respostas Corretas</p>
          <p class="text-2xl font-bold text-green-600">{{ correctAnswers }}</p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center space-x-3">
        <div
          class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-check-circle" class="text-yellow-600 text-xl" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Parcialmente Corretas</p>
          <p class="text-2xl font-bold text-yellow-600">
            {{ partiallyCorrectAnswers }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center space-x-3">
        <div
          class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-x" class="text-red-600 text-xl" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Respostas Incorretas</p>
          <p class="text-2xl font-bold text-red-600">{{ incorrectAnswers }}</p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center space-x-3">
        <div
          class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-clock-3" class="text-blue-600 text-xl" />
        </div>
        <div>
          <p class="text-sm text-gray-500">Tempo Médio / Questão</p>
          <p class="text-2xl font-bold text-blue-600">
            {{ averageTimePerQuestion }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
