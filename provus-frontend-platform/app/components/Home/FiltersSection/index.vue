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

const sortOptions = ["Mais Recente", "Mais Antigo", "Título A-Z", "Título Z-A"];
</script>

<template>
  <UCard class="mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <UFormField label="Buscar Avaliações" class="w-full">
        <UInput
          v-model="search"
          placeholder="Buscar por título..."
          icon="i-lucide-search"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Filtrar por Status" class="w-full md:w-1/4">
        <USelect v-model="status" class="w-full" :items="statusOptions" />
      </UFormField>
      <UFormField label="Ordenar Por" class="w-full md:w-1/4">
        <USelect v-model="sortBy" class="w-full" :items="sortOptions" />
      </UFormField>
    </div>
  </UCard>
</template>
