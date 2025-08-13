<script setup lang="ts">
import type { ISubmissao } from "~/types/ISubmissao";

const props = defineProps<{
  submission: ISubmissao;
  totalScore: number;
}>();

const formattedDate = computed(() => {
  if (!props.submission.finalizadoEm) return "N/A";
  return new Date(props.submission.finalizadoEm).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const timeTaken = computed(() => {
  if (!props.submission.iniciadoEm || !props.submission.finalizadoEm)
    return "-";
  const inicio = new Date(props.submission.iniciadoEm);
  const fim = new Date(props.submission.finalizadoEm);
  const diffMinutos = Math.round((fim.getTime() - inicio.getTime()) / 60000);
  return `${diffMinutos} minutos`;
});

const scorePercent = computed(() => {
  const studentScore = props.submission.pontuacaoTotal || 0;
  const totalPossible = props.totalScore || 1;
  return ((studentScore / totalPossible) * 100).toFixed(1);
});
</script>

<template>
  <UCard class="mb-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <UAvatar :alt="submission.aluno.nome" size="3xl" />
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ submission.aluno.nome }}
          </h1>
          <p class="text-gray-600 mt-1">{{ submission.aluno.email }}</p>
          <div class="flex items-center space-x-6 mt-3">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Nota:</span>
              <span class="text-2xl font-bold text-secondary"
                >{{ scorePercent }}%</span
              >
              <span class="text-sm text-gray-500"
                >({{ submission.pontuacaoTotal || 0 }}/{{
                  totalScore
                }}
                pontos)</span
              >
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Tempo:</span>
              <span class="font-semibold text-gray-900">{{ timeTaken }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Enviado em:</span>
              <span class="font-semibold text-gray-900">{{
                formattedDate
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
