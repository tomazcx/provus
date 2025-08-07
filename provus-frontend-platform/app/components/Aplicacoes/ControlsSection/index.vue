<script setup lang="ts">
const searchTerm = ref("");
</script>

<template>
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center space-x-4">
      <UInput
        v-model="searchTerm"
        icon="i-lucide-search"
        placeholder="Filtrar aplicações por nome..."
        class="w-80"
      />
      <UButton variant="soft" color="gray" icon="i-lucide-arrow-up-down">
        Ordenar por Data
      </UButton>
      <UButton variant="soft" color="gray" icon="i-lucide-filter">
        Filtros
      </UButton>
    </div>
  </div>
</template>
