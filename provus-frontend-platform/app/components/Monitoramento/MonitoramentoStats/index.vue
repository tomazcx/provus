<script setup lang="ts">
import type { IProgressoAluno } from "~/types/interfaces/IMonitoring";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

const props = defineProps<{
  progressoAlunos: IProgressoAluno[];
}>();

const totalAlunos = computed(() => props.progressoAlunos.length);
const alunosAtivos = computed(
  () =>
    props.progressoAlunos.filter(
      (p) => p.estado === EstadoSubmissaoEnum.INICIADA
    ).length
);
const alunosFinalizaram = computed(
  () =>
    props.progressoAlunos.filter(
      (p) =>
        p.estado === EstadoSubmissaoEnum.AVALIADA ||
        p.estado === EstadoSubmissaoEnum.ENVIADA ||
        p.estado === EstadoSubmissaoEnum.ENCERRADA ||
        p.estado === EstadoSubmissaoEnum.CODIGO_CONFIRMADO ||
        p.estado === EstadoSubmissaoEnum.CANCELADA ||
        p.estado === EstadoSubmissaoEnum.ABANDONADA
    ).length
);
const totalAlertas = computed(() =>
  props.progressoAlunos.reduce((acc, p) => acc + p.alertas, 0)
);

const stats = computed(() => [
  {
    title: "Total de Alunos",
    value: totalAlunos.value,
    icon: "i-lucide-users",
    color: "blue",
  },
  {
    title: "Ativos",
    value: alunosAtivos.value,
    icon: "i-lucide-user-check",
    color: "green",
  },
  {
    title: "Finalizaram",
    value: alunosFinalizaram.value,
    icon: "i-lucide-check-circle",
    color: "green",
  },
  {
    title: "Alertas Gerados",
    value: totalAlertas.value,
    icon: "i-lucide-shield-alert",
    color: "red",
  },
]);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <UCard v-for="stat in stats" :key="stat.title">
      <div class="flex items-center space-x-3">
        <div
          :class="`bg-${stat.color}-100`"
          class="w-12 h-12 rounded-lg flex items-center justify-center"
        >
          <Icon
            :name="stat.icon"
            :class="`text-${stat.color}-600`"
            class="text-xl"
          />
        </div>
        <div>
          <p class="text-sm text-gray-600">{{ stat.title }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
