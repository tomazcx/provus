<script setup lang="ts">
import ApplicationCard from "~/components/Aplicacoes/ApplicationCard/index.vue";
import { useApplicationsStore } from "~/store/applicationsStore";

const applicationsStore = useApplicationsStore();

const applications = computed(() => applicationsStore.applications);

onMounted(() => {
  applicationsStore.fetchItems();
});
</script>

<template>
  <div>
    <div v-if="applicationsStore.isLoading" class="text-center text-gray-500">
      <Icon name="i-lucide-loader-2" class="animate-spin h-8 w-8" />
      <p>Carregando aplicações...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ApplicationCard v-for="app in applications" :key="app.id" :item="app" />
    </div>
  </div>
</template>
