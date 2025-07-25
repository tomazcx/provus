<script setup lang="ts">
import type { IConfiguracoes } from "~/types/IConfiguracoesAvaliacoes";

const model = defineModel<IConfiguracoes>({ required: true });
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
        <USwitch v-model="model.mostrarPontuacao" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700"
          >Correção de questões discursivas via I.A</span
        >
        <USwitch v-model="model.autocorrecaoIa" />
      </div>

      <UFormField
        v-if="model.permitirMultiplosEnvios"
        label="Tentativas Permitidas"
        size="md"
        class="w-full"
      >
        <USelect
          v-model="model.numeroMaximoDeEnvios"
          :items="tentativas"
          class="w-full"
        />
      </UFormField>
    </div>
  </UCard>
</template>
