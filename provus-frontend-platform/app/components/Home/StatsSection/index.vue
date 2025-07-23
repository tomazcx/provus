<template>
  <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
    <div
      v-for="stat in stats"
      :key="stat.title"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
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

<script setup lang="ts">
const stats = [
  {
    title: "Total",
    value: 24,
    icon: "i-lucide-file-text",
    bgIcon: "bg-blue-100 text-blue-600",
  },
  {
    title: "Em andamento",
    value: 3,
    icon: "i-lucide-clock",
    bgIcon: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Finalizadas",
    value: 18,
    icon: "i-lucide-check-circle",
    bgIcon: "bg-green-100 text-green-600",
  },
  {
    title: "Agendadas",
    value: 5,
    icon: "i-lucide-calendar-check",
    bgIcon: "bg-purple-100 text-purple-600",
  },
  {
    title: "Administradas",
    value: 21,
    icon: "i-lucide-check-square",
    bgIcon: "bg-orange-100 text-orange-600",
  },
];
</script>
