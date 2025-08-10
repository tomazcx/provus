<script setup lang="ts">
import type { IAplicacao } from "~/types/IAplicacao";

defineProps<{
  modelValue: boolean;
  aplicacao: IAplicacao | null;
}>();

const emit = defineEmits(["update:modelValue", "start-now"]);

const studentUrl = "https://provus.com.br/aluno/entrar";

function handleStart() {
  emit("start-now");
}
</script>

<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-key-round" class="text-white text-2xl" />
        </div>
        <div>
          <h2 class="text-xl font-bold">Aplicação Pronta para Iniciar</h2>
          <p class="text-sm text-gray-500">
            Compartilhe o código com seus alunos.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="text-center py-8">
        <p class="text-lg text-gray-600 mb-2">Código de Acesso:</p>
        <div class="bg-primary-light text-white rounded-lg p-4 inline-block">
          <span class="text-5xl font-bold tracking-widest">{{
            aplicacao?.codigoDeAcesso
          }}</span>
        </div>
        <div class="mt-6">
          <p class="text-sm text-gray-500">URL para os alunos:</p>
          <a
            :href="studentUrl"
            target="_blank"
            class="font-medium text-primary hover:underline"
            >{{ studentUrl }}</a
          >
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between items-center">
        <UButton
          variant="ghost"
          color="primary"
          @click="$emit('update:modelValue', false)"
        >
          Fechar
        </UButton>
        <UButton color="secondary" icon="i-lucide-play" @click="handleStart">
          Iniciar Aplicação Agora
        </UButton>
      </div>
    </template>
  </UModal>
</template>
