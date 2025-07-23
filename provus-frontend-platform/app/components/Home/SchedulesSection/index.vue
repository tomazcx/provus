<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Próximos agendamentos</h2>
    <div class="space-y-3">
      <div
        v-for="item in schedules"
        :key="item.title"
        class="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
      >
        <div class="flex items-center">
          <div
            class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3"
          >
            <Icon name="i-lucide-calendar" class="text-purple-600" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">{{ item.when }}</p>
          </div>
        </div>
        <span class="text-sm text-purple-600 font-medium">{{ item.in }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const schedules = [
  { title: "Quiz de química", when: "Amanhã às 14:00", in: "Em 1 dia" },
  {
    title: "Exame final de matemática",
    when: "Sexta-feira às 09:00",
    in: "Em 5 dias",
  },
];
</script>
