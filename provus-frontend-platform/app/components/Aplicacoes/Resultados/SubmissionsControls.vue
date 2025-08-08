<script setup lang="ts">
const filters = reactive({
  search: "",
  type: "Todos os tipos",
});
</script>
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="flex gap-4 w-full">
      <UFormField label="Buscar" class="w-full">
        <UInput
          v-model="filters.search"
          placeholder="Buscar por nome ou email"
          icon="i-lucide-search"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Tipo de status" class="w-full">
        <USelect
          v-model="filters.type"
          :items="[
            'Todos os tipos',
            'Iniciada',
            'Enviada',
            'Avaliada',
            'Encerrada',
            'Abandonada',
            'Reaberta',
          ]"
          class="w-full"
        />
      </UFormField>
    </div>
  </div>
</template>
