<script setup lang="ts">
const filters = reactive({
  search: "",
  type: "Todos",
  sortBy: "Última Modificação",
});
</script>
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="flex gap-4 w-full">
      <UFormField label="Buscar" class="w-full">
        <UInput
          v-model="filters.search"
          placeholder="Buscar por nome"
          icon="i-lucide-search"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Tipo de status" class="w-full">
        <USelect
          v-model="filters.type"
          :items="[
            'Todos',
            'Em Andamento',
            'Agendada',
            'Concluída',
            'Cancelada',
          ]"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Ordenar Por" class="w-full">
        <USelect
          v-model="filters.sortBy"
          class="w-full"
          :items="[
            'Última Modificação',
            'Mais Recente',
            'Mais Antigo',
            'Título A-Z',
          ]"
        />
      </UFormField>
    </div>
  </div>
</template>
