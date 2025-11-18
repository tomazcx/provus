<script setup lang="ts">
import { useApplicationsStore } from "~/store/applicationsStore";

const applicationsStore = useApplicationsStore();
const statsData = computed(() => applicationsStore.dashboardStats);

const stats = computed(() => [
  {
    title: "Total de Aplicações",
    value: statsData.value.total,
    icon: "i-lucide-file-text",
    color: "blue",
  },
  {
    title: "Em Andamento",
    value: statsData.value.emAndamento,
    icon: "i-lucide-clock",
    color: "yellow",
  },
  {
    title: "Concluídas",
    value: statsData.value.concluidas,
    icon: "i-lucide-check-circle",
    color: "green",
  },
  {
    title: "Agendadas",
    value: statsData.value.agendadas,
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
