<script setup lang="ts">
import type { SubmissaoResponse } from "~/types/api/response/Submissao.response";

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
  if (!props.submission.criadoEm || !props.submission.finalizadoEm) {
    return "--";
  }

  try {
    const inicio = new Date(props.submission.criadoEm).getTime();
    const fim = new Date(props.submission.finalizadoEm).getTime();

    if (isNaN(inicio) || isNaN(fim)) return "--";

    const diffMs = fim - inicio;
    if (diffMs < 0) return "--";

    const diffMinutos = Math.floor(diffMs / 60000);

    if (diffMinutos === 0) {
      const diffSegundos = Math.floor(diffMs / 1000);
      return `${diffSegundos} segundos`;
    }

    return `${diffMinutos} minutos`;
  } catch {
    return "--";
  }
});

const studentScore = computed(
  () => Number(props.submission.pontuacaoTotal) || 0
);

const scorePercent = computed(() => {
  const totalPossible =
    Number(props.totalScore) > 0 ? Number(props.totalScore) : 1;
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
