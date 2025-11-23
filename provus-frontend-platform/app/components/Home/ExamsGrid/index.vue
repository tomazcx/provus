<script setup lang="ts">
import ExamCard from "~/components/Home/ExamCard/index.vue";
import type { AplicacaoEntity } from "~/types/entities/Aplicacao.entity";

defineProps<{
  applications: AplicacaoEntity[];
  isLoading: boolean;
}>();
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Aplicações Recentes</h2>
        <span class="text-sm text-gray-500"
          >{{ applications.length }} aplicações listadas</span
        >
      </div>
    </template>

    <div v-if="isLoading" class="flex justify-center py-8 text-gray-500">
      <Icon
        name="i-lucide-loader-2"
        class="animate-spin h-8 w-8 text-primary"
      />
    </div>

    <div
      v-else-if="applications.length === 0"
      class="text-center py-8 text-gray-500"
    >
      Nenhuma aplicação encontrada com os filtros atuais.
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <ExamCard v-for="app in applications" :key="app.id" :item="app" />
    </div>
  </UCard>
</template>
