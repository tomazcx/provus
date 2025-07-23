<script setup lang="ts">
import type { IProvaConfiguracoes } from "@/types/Avaliacao";

const model = defineModel<IProvaConfiguracoes>({ required: true });
const tentativas = [1, 2, 3, "Ilimitado"];
</script>
<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Configurações Rápidas</h3>
    </template>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Embaralhar Questões</span>
        <USwitch v-model="model.embaralharQuestoes" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700"
          >Mostrar Resultados Imediatamente</span
        >
        <USwitch v-model="model.mostrarResultados" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Permitir Refazer</span>
        <USwitch v-model="model.permitirRefazer" />
      </div>
      <UFormField
        v-if="model.permitirRefazer"
        label="Tentativas Permitidas"
        size="md"
        class="w-full"
      >
        <USelect
          v-model="model.tentativasPermitidas"
          :items="tentativas"
          class="w-full"
        />
      </UFormField>
    </div>
  </UCard>
</template>
