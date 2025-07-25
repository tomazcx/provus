<script setup lang="ts">
import { mockDashboardResponse } from "~/mock/mockDashboardResponse";

const stats = [
  {
    title: "Total de avaliações",
    value: mockDashboardResponse.totalAvaliacoes,
    bgIcon: "bg-blue-100 text-blue-600",
    icon: "i-lucide-file-text",
  },
  {
    title: "Avaliações em andamento",
    value: mockDashboardResponse.avaliacoesEmAndamento,
    bgIcon: "bg-yellow-100 text-yellow-600",
    icon: "i-lucide-clock",
  },
  {
    title: "Avaliações finalizadas",
    value: mockDashboardResponse.avaliacoesFinalizadas,
    bgIcon: "bg-green-100 text-green-600",
    icon: "i-lucide-check-circle",
  },
];
</script>

<template>
  <div class="flex gap-4 mb-8">
    <div
      v-for="stat in stats"
      :key="stat.title"
      class="bg-white w-full rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div class="flex items-center">
        <div
          :class="
            stat.bgIcon +
            ' w-12 h-12 rounded-lg flex items-center justify-center'
          "
        >
          <Icon :name="stat.icon" class="text-xl" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-600">{{ stat.title }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
