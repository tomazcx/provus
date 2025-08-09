<script setup lang="ts">
const search = ref("");
const status = ref("Todos");
const sortBy = ref("Última Modificação");
</script>
<template>
  <UCard class="mb-6">
    <div class="flex space-x-4">
      <UFormField label="Buscar Avaliações" class="w-full">
        <UInput
          v-model="search"
          placeholder="Buscar por título..."
          icon="i-lucide-search"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Filtrar por Status" class="w-full">
        <USelect
          v-model="status"
          class="w-full"
          :items="[
            'Todos',
            'Em Andamento',
            'Agendada',
            'Concluída',
            'Cancelada',
          ]"
        />
      </UFormField>
      <UFormField label="Ordenar Por" class="w-full">
        <USelect
          v-model="sortBy"
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
  </UCard>
</template>
