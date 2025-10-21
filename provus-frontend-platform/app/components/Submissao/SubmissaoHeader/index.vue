<script setup lang="ts">
import type { SubmissaoResponse } from '~/types/api/response/Submissao.response';


interface Estudante {
  nome: string;
  email: string;
}

const props = defineProps<{
  submission: SubmissaoResponse;
  student: Estudante;
  totalScore: number;
}>();

const formattedDate = computed(() => {
  if (!props.submission.finalizadoEm) return "N/A";
  try {
    return new Date(props.submission.finalizadoEm).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Data inválida";
  }
});

const timeTaken = computed(() => {
  if (!props.submission.criadoEm || !props.submission.finalizadoEm) return "-";
  try {
    const inicio = new Date(props.submission.criadoEm);
    const fim = new Date(props.submission.finalizadoEm);
    const diffMinutos = Math.round((fim.getTime() - inicio.getTime()) / 60000);
    if (isNaN(diffMinutos) || diffMinutos < 0) return "-";
    return `${diffMinutos} minutos`;
  } catch {
    return "-";
  }
});

const studentScore = computed(() => props.submission.pontuacaoTotal ?? 0);

const scorePercent = computed(() => {
  const totalPossible = props.totalScore > 0 ? props.totalScore : 1;
  return ((studentScore.value / totalPossible) * 100).toFixed(1);
});
</script>
<template>
  <UCard class="mb-8">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center space-x-4">
        <UAvatar :alt="student.nome" size="3xl" />
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ student.nome }}
          </h1>

          <p class="text-gray-600 mt-1">{{ student.email }}</p>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6"
      >
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Nota:</span>
          <span class="text-2xl font-bold text-secondary"
            >{{ scorePercent }}%</span
          >

          <span class="text-sm text-gray-500"
            >({{ studentScore }}/{{ totalScore }} pontos)</span
          >
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Tempo:</span>
          <span class="font-semibold text-gray-900">{{ timeTaken }}</span>
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Enviado em:</span>

          <span class="font-semibold text-gray-900">{{ formattedDate }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
