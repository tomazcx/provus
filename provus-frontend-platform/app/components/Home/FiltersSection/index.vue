<script setup lang="ts">
import { reactive } from "vue";

const state = reactive({
  search: "",
  sortBy: "",
  eventFilter: "",
  dateFrom: "",
  dateTo: "",
});

const sortOptions = ["Última modificação", "Data de criação", "Título A‑Z"];

const eventOptions = [
  "Todos as avaliações",
  "Administradas",
  "Em andamento",
  "Finalizadas",
  "Agendadas",
  "Rascunhos",
];
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <UFormField label="Buscar avaliações">
        <UInput
          v-model="state.search"
          placeholder="Busque por título..."
          icon="i-lucide-search"
          variant="outline"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Ordene por">
        <USelect
          v-model="state.sortBy"
          :items="sortOptions"
          placeholder="Selecione uma opção"
          variant="outline"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Filtro">
        <USelect
          v-model="state.eventFilter"
          :items="eventOptions"
          placeholder="Selecione um filtro"
          variant="outline"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Data de Início">
        <UInput
          v-model="state.dateFrom"
          type="date"
          variant="outline"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Data de Término">
        <UInput
          v-model="state.dateTo"
          type="date"
          variant="outline"
          class="w-full"
        />
      </UFormField>
    </div>
  </div>
</template>
