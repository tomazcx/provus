<script setup lang="ts">
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

const props = defineProps<{
  titulo: string;
  descricao?: string;
  dataAplicacao: string;
}>();
const dataAplicacaoFormatada = computed(() => {
  return new Date(props.dataAplicacao).toLocaleDateString("pt-BR");
});
const horaAplicacaoFormatada = computed(() => {
  return new Date(props.dataAplicacao).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>
<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <div
          class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-file-text" class="text-blue-600 text-2xl" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-2xl font-bold text-gray-900 leading-tight">
            <RichTextEditor
              :model-value="titulo"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none"
            />
          </div>
          <div v-if="descricao" class="text-gray-600 mt-1 text-sm">
            <RichTextEditor
              :model-value="descricao"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div class="text-gray-600 flex gap-4">
        <p class="text-gray-600 flex items-center gap-1">
          <Icon name="i-lucide-calendar-days" />
          {{ dataAplicacaoFormatada }}
        </p>

        <p class="text-gray-600 flex items-center gap-1">
          <Icon name="i-lucide-clock" />
          {{ horaAplicacaoFormatada }}
        </p>
      </div>
    </div>
  </div>
</template>
