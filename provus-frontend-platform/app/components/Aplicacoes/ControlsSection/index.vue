<script setup lang="ts">
const search = defineModel<string>("search");
const status = defineModel<string>("status");
const sortBy = defineModel<string>("sortBy");

const statusOptions = [
  "Todos",
  "Em Andamento",
  "Agendada",
  "Concluída",
  "Finalizada",
  "Pausada",
  "Cancelada",
  "Criada",
];

const sortOptions = [
  "Última Modificação",
  "Mais Recente",
  "Mais Antigo",
  "Título A-Z",
  "Título Z-A",
];
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="flex flex-col md:flex-row gap-4 w-full">
      <UFormField label="Buscar" class="w-full">
        <UInput
          v-model="search"
          placeholder="Buscar por título"
          icon="i-lucide-search"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Status" class="w-full md:w-1/4">
        <USelect v-model="status" :items="statusOptions" class="w-full" />
      </UFormField>

      <UFormField label="Ordenar Por" class="w-full md:w-1/4">
        <USelect v-model="sortBy" class="w-full" :items="sortOptions" />
      </UFormField>
    </div>
  </div>
</template>
