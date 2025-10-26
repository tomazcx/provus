<script setup lang="ts">
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

const searchModel = defineModel<string>("search");
const statusModel = defineModel<EstadoSubmissaoEnum | "Todos">("status");

const statusOptions = ["Todos", ...Object.values(EstadoSubmissaoEnum)];
</script>
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div class="flex gap-4 w-full">
      <UFormField label="Buscar" class="w-full">
        <UInput
          v-model="searchModel"
          placeholder="Buscar por nome ou email"
          icon="i-lucide-search"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Filtrar por Status" class="w-full">
        <USelect v-model="statusModel" :items="statusOptions" class="w-full" />
      </UFormField>
    </div>
  </div>
</template>
