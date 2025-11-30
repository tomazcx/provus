<script setup lang="ts">
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import DificuldadeRandomizacaoEnum from "~/enums/DificuldadeRandomizacaoEnum";

const model = defineModel<AvaliacaoEntity>({ required: true });

const isRandomizacaoSimplesActive = computed({
  get: () =>
    model.value.configuracao.configuracoesGerais.configuracoesRandomizacao[0]
      ?.tipo === TipoRandomizacaoEnum.SIMPLES,
  set: (value) => {
    const gerais = model.value.configuracao.configuracoesGerais;
    const currentType = gerais.configuracoesRandomizacao[0]?.tipo;

    if (value) {
      gerais.configuracoesRandomizacao = [
        {
          id: Date.now(),
          tipo: TipoRandomizacaoEnum.SIMPLES,
          dificuldade:
            gerais.configuracoesRandomizacao[0]?.dificuldade ||
            DificuldadeRandomizacaoEnum.QUALQUER,
          quantidade: 0,
          questoes: [],
        },
      ];
    } else if (currentType === TipoRandomizacaoEnum.SIMPLES) {
      gerais.configuracoesRandomizacao = [];
    }
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
        <USwitch
          v-model="model.configuracao.configuracoesGerais.mostrarPontuacao"
        />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700"
          >Autocorreção de discursivas via I.A</span
        >
        <USwitch
          v-model="
            model.configuracao.configuracoesSeguranca
              .ativarCorrecaoDiscursivaViaIa
          "
        />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Tempo Mínimo (minutos)</span>
        <UInputNumber
          v-model="model.configuracao.configuracoesGerais.tempoMinimo"
          class="w-32"
        />
      </div>
    </div>
  </UCard>
</template>
