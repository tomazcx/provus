<script setup lang="ts">
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

const model = defineModel<AvaliacaoEntity | null>({ required: true });

const totalPontos = computed(() => {
  if (!model.value || !model.value.questoes) return 0;
  return model.value.questoes.reduce(
    (acc, q) => acc + (Number(q.pontuacao) || 0),
    0
  );
});

watch(totalPontos, (newVal) => {
  if (model.value) {
    model.value.pontuacao = newVal;
  }
});
</script>

<template>
  <UCard v-if="model">
    <div class="space-y-4">
      <UFormField label="Título da Prova">
        <RichTextEditor
          v-model="model.titulo"
          placeholder="Digite o título da prova..."
          min-height="min-h-[40px]"
        />
      </UFormField>

      <div class="flex flex-col lg:flex-row gap-4">
        <UFormField label="Duração (minutos)" class="w-full">
          <UInputNumber
            v-model="model.configuracao.configuracoesGerais.tempoMaximo"
            class="w-full"
            :min="1"
          />
        </UFormField>
        <UFormField label="Pontos Totais" class="w-full">
          <UInput
            :model-value="totalPontos"
            class="w-full"
            placeholder="Ex: 100"
            readonly
            variant="soft"
          />
        </UFormField>
      </div>

      <UFormField label="Instruções" class="w-full">
        <RichTextEditor
          v-model="model.descricao"
          placeholder="Digite as instruções para os alunos..."
        />
      </UFormField>
    </div>
  </UCard>
</template>
