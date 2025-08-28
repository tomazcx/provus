<script setup lang="ts">
import type { IConfiguracoes } from "~/types/IConfiguracoesAvaliacoes";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";

const model = defineModel<IConfiguracoes>({ required: true });

const isRandomizacaoSimplesActive = computed({
  get: () => model.value.tipoRandomizacao === TipoRandomizacaoEnum.SIMPLES,
  set: (value) => {
    if (
      model.value.tipoRandomizacao &&
      model.value.tipoRandomizacao !== TipoRandomizacaoEnum.SIMPLES
    ) {
      return;
    }
    model.value.tipoRandomizacao = value ? TipoRandomizacaoEnum.SIMPLES : null;
  },
});
</script>

<template>
  <UCard v-if="model">
    <template #header>
      <h3 class="text-lg font-semibold">Configurações Rápidas</h3>
    </template>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Randomização Simples</span>
        <USwitch v-model="isRandomizacaoSimplesActive" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Exibir Pontuação ao Finalizar</span>
        <USwitch v-model="model.exibirPontuacaDaSubmissao" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700"
          >Autocorreção de discursivas via I.A</span
        >
        <USwitch v-model="model.autocorrecaoIa" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Tempo Mínimo (minutos)</span>
        <UInputNumber v-model="model.tempoMinimo" class="w-32" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Tentativas Permitidas</span>
        <UInputNumber v-model="model.numeroMaximoDeEnvios" class="w-28" />
      </div>
    </div>
  </UCard>
</template>
