<script setup lang="ts">
import type { IConfiguracoes } from "~/types/IConfiguracoesAvaliacoes";

defineProps<{
  modelValue: boolean;
  materiais?: IConfiguracoes["materiaisAnexados"];
}>();
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <UModal
    :open="modelValue"
    class="w-full sm:max-w-4xl"
    @update:open="emit('update:modelValue', $event)"
  >
    <template #header>
      <h2 class="text-xl font-bold text-gray-900">Materiais de Consulta</h2>
    </template>
    <template #body>
      <div class="max-h-[60vh] overflow-y-auto">
        <div
          v-if="!materiais || materiais.arquivos.length === 0"
          class="text-center text-gray-500 py-8"
        >
          Nenhum material de consulta disponível para esta avaliação.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="file in materiais.arquivos"
            :key="file.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <a
              :href="file.url"
              target="_blank"
              class="flex items-center space-x-3"
            >
              <Icon name="i-lucide-file-text" class="text-primary text-xl" />
              <span class="font-medium text-gray-800">{{ file.titulo }}</span>
            </a>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
