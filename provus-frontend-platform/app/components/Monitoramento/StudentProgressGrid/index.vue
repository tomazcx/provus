<script setup lang="ts">
import type { IProgressoAluno } from "~/types/IMonitoring";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

defineProps({
  progressoAlunos: {
    type: Array as PropType<IProgressoAluno[]>,
    required: true,
  },
  getTempoRestante: {
    type: Function as PropType<(aluno: IProgressoAluno) => string>,
    required: true,
  },
});

type UBadgeColor =
  | "success"
  | "warning"
  | "info"
  | "error"
  | "gray"
  | "primary"
  | "white"
  | "black"
  | "secondary"
  | "primary-light"
  | "primary-dark"
  | "secondary-light"
  | "secondary-dark"
  | "neutral"
  | undefined;

function getStatusVisuals(estado: EstadoSubmissaoEnum): {
  text: string;
  color: UBadgeColor;
} {
  const map: Record<EstadoSubmissaoEnum, { text: string; color: UBadgeColor }> =
    {
      [EstadoSubmissaoEnum.INICIADA]: { text: "Ativo", color: "success" },
      [EstadoSubmissaoEnum.PAUSADA]: { text: "Pausado", color: "warning" },
      [EstadoSubmissaoEnum.AVALIADA]: { text: "Finalizado", color: "info" },
      [EstadoSubmissaoEnum.ENVIADA]: { text: "Finalizado", color: "info" },
      [EstadoSubmissaoEnum.ABANDONADA]: { text: "Abandonou", color: "error" },
      [EstadoSubmissaoEnum.ENCERRADA]: { text: "Encerrado", color: "gray" },
      [EstadoSubmissaoEnum.CANCELADA]: { text: "Cancelado", color: "gray" },
      [EstadoSubmissaoEnum.REABERTA]: { text: "Reaberto", color: "warning" },
    };
  return map[estado] || { text: "Desconhecido", color: "gray" };
}
</script>
<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900">Progresso dos Alunos</h2>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="aluno in progressoAlunos"
        :key="aluno.aluno.id"
        class="p-4 border border-gray-200 rounded-lg"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <UAvatar :alt="aluno.aluno.nome" size="sm" />
            <span class="font-medium text-gray-900 text-sm">{{
              aluno.aluno.nome
            }}</span>
          </div>
          <UBadge
            :color="getStatusVisuals(aluno.estado).color"
            variant="subtle"
            >{{ getStatusVisuals(aluno.estado).text }}</UBadge
          >
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso</span>
            <span
              >{{ aluno.questoesRespondidas }}/{{ aluno.totalQuestoes }}</span
            >
          </div>
          <UProgress
            v-model="aluno.progresso"
            :color="aluno.alertas > 0 ? 'error' : 'secondary'"
          />
        </div>
        <div class="text-xs text-gray-500">
          Iniciou: {{ new Date(aluno.horaInicio).toLocaleTimeString("pt-BR") }}
        </div>
        <div class="font-mono">{{ getTempoRestante(aluno) }}</div>
        <div>{{ aluno.alertas }} Alertas</div>
      </div>
    </div>
  </UCard>
</template>
