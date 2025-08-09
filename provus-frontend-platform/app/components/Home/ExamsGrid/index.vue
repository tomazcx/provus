<script setup lang="ts">
import ExamCard from "~/components/Home/ExamCard/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import type { IAplicacao } from "~/types/IAplicacao";

const applicationsStore = useApplicationsStore();

onMounted(() => {
  applicationsStore.fetchItems();
});

type StateVisual = {
  status: string;
  icon: string;
  color: string;
};

const stateMap: Partial<Record<EstadoAplicacaoEnum, StateVisual>> = {
  [EstadoAplicacaoEnum.CONCLUIDA]: {
    status: "Concluída",
    icon: "i-lucide-check-circle",
    color: "green",
  },
  [EstadoAplicacaoEnum.EM_ANDAMENTO]: {
    status: "Em Andamento",
    icon: "i-lucide-clock",
    color: "yellow",
  },
  [EstadoAplicacaoEnum.AGENDADA]: {
    status: "Agendada",
    icon: "i-lucide-calendar",
    color: "purple",
  },
  [EstadoAplicacaoEnum.CANCELADA]: {
    status: "Cancelada",
    icon: "i-lucide-x-circle",
    color: "red",
  },
};

const exams = computed(() => {
  return applicationsStore.applications.map((app: IAplicacao) => {
    const visual =
      stateMap[app.estado] || stateMap[EstadoAplicacaoEnum.AGENDADA];
    return {
      id: app.id,
      title: app.titulo,
      description: `Aplicado em ${new Date(
        app.dataAplicacao
      ).toLocaleDateString("pt-BR")}`,
      status: visual?.status ?? "",
      studentInfo: `${app.participantes} participantes`,
      timeInfo: `Média de ${app.mediaGeral}%`,
      icon: visual?.icon ?? "",
      color: visual?.color ?? "",
    };
  });
});
</script>
<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Aplicações Recentes</h2>
        <span class="text-sm text-gray-500"
          >{{ applicationsStore.applications.length }} aplicações no total</span
        >
      </div>
    </template>
    <div v-if="applicationsStore.isLoading" class="text-center text-gray-500">
      Carregando...
    </div>
    <div v-else class="space-y-4">
      <ExamCard v-for="exam in exams" :key="exam.id" :item="exam" />
    </div>
  </UCard>
</template>
