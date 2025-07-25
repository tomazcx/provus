<script setup lang="ts">
import type { AvaliacaoImpl } from "~/types/IAvaliacao";

const model = defineModel<AvaliacaoImpl>({ required: true });
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <UFormField label="Título da Prova">
        <UInput
          v-model="model.titulo"
          variant="none"
          size="xl"
          placeholder="Digite o título da prova..."
          class="font-bold text-primary"
        />
      </UFormField>
      <div class="flex flex-col lg:flex-row gap-4">
        <UFormField label="Duração" class="w-full">
          <UInput
            v-model="model.duracao"
            class="w-full"
            placeholder="Ex: 120 minutos"
          />
        </UFormField>
        <UFormField label="Pontos Totais" class="w-full">
          <UInput
            v-model.number="model.pontuacao"
            class="w-full"
            placeholder="Ex: 100"
          />
        </UFormField>
      </div>
      <UFormField label="Instruções" class="w-full">
        <UTextarea
          v-model="model.descricao"
          :rows="3"
          class="w-full"
          placeholder="Digite as instruções para os alunos..."
          autoresize
        />
      </UFormField>
    </div>
  </UCard>
</template>
