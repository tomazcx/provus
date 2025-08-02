<script setup lang="ts">
import type { IConfiguracoes } from "~/types/IConfiguracoesAvaliacoes";

const model = defineModel<IConfiguracoes>({ required: true });
</script>
<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Configurações Rápidas</h3>
    </template>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700"
          >Correção de questões discursivas via I.A</span
        >
        <USwitch v-model="model.autocorrecaoIa" />
      </div>
    </div>
  </UCard>
</template>
