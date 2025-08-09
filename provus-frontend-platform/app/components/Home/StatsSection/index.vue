<script setup lang="ts">
import { useApplicationsStore } from "~/store/applicationsStore";
import { useExamBankStore } from "~/store/assessmentBankStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import isFolder from "~/guards/isFolder";

const applicationsStore = useApplicationsStore();
const examBankStore = useExamBankStore();

onMounted(() => {
  applicationsStore.fetchItems();
  examBankStore.fetchItems();
});

const totalAplicacoes = computed(() => {
  return (
    aplicacoesEmAndamento.value +
    aplicacoesFinalizadas.value +
    avaliacoesAgendadas.value
  );
});

const aplicacoesEmAndamento = computed(
  () =>
    applicationsStore.applications.filter(
      (app) => app.estado === EstadoAplicacaoEnum.EM_ANDAMENTO
    ).length
);
const aplicacoesFinalizadas = computed(
  () =>
    applicationsStore.applications.filter(
      (app) => app.estado === EstadoAplicacaoEnum.CONCLUIDA
    ).length
);

const avaliacoesAgendadas = computed(() => {
  const agora = new Date();
  return examBankStore.items.filter(
    (item) =>
      !isFolder(item) &&
      item.configuracoes?.dataAgendada &&
      new Date(item.configuracoes.dataAgendada) > agora
  ).length;
});

const stats = computed(() => [
  {
    title: "Total de Aplicações",
    value: totalAplicacoes.value,
    icon: "i-lucide-file-text",
    color: "blue",
  },
  {
    title: "Em Andamento",
    value: aplicacoesEmAndamento.value,
    icon: "i-lucide-clock",
    color: "yellow",
  },
  {
    title: "Concluídas",
    value: aplicacoesFinalizadas.value,
    icon: "i-lucide-check-circle",
    color: "green",
  },
  {
    title: "Agendadas",
    value: avaliacoesAgendadas.value,
    icon: "i-lucide-calendar",
    color: "purple",
  },
]);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <UCard v-for="stat in stats" :key="stat.title">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ stat.value }}</p>
        </div>
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
      </div>
    </UCard>
  </div>
</template>
