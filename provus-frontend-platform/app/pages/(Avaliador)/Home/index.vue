<script setup lang="ts">
import FiltersSection from "~/components/Home/FiltersSection/index.vue";
import StatsSection from "~/components/Home/StatsSection/index.vue";
import SchedulesSection from "~/components/Home/SchedulesSection/index.vue";
import ExamsGrid from "~/components/Home/ExamsGrid/index.vue";
</script>
<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
      <div>
        <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Gerencie suas avaliações de forma eficiente
        </p>
      </div>
      <NuxtLink
        to="/avaliacao/editor"
        class="mt-4 sm:mt-0 bg-secondary hover:bg-secondary-dark cursor-pointer text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
      >
        <Icon name="i-lucide-plus" class="mr-2" />
        Criar nova avaliação
      </NuxtLink>
    </div>

    <FiltersSection />

    <StatsSection />

    <SchedulesSection />

    <ExamsGrid />
  </div>
</template>
