<script setup lang="ts">
import type { IAvaliacaoImpl } from '~/types/IAvaliacao';

defineProps<{ avaliacao: IAvaliacaoImpl }>();
const emit = defineEmits(['submit']);
</script>

<template>
  <div class="fixed top-0 left-0 right-0 bg-white text-primary px-6 py-3 flex items-center justify-between z-50 shadow-lg">
    <div class="flex items-center space-x-4">
      <div class="bg-opacity-20 rounded-lg px-3 py-1">
        <span class="font-semibold">{{ avaliacao.titulo }}</span>
      </div>
      <span class="text-sm opacity-90">Prof. Responsável</span>
    </div>
    
    <div class="flex items-center space-x-6">
      <div class="flex items-center space-x-2">
        <Icon name="i-lucide-clock" />
        <span class="font-mono text-lg font-semibold">01:00:00</span>
      </div>
      
      <UButton color="secondary" @click="emit('submit')">
        <Icon name="i-lucide-send" class="mr-2" />
        Entregar Avaliação
      </UButton>
    </div>
  </div>
</template>