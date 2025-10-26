<script setup lang="ts">
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

        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ titulo }}
          </h1>

          <p class="text-gray-600">{{ descricao }}</p>
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
