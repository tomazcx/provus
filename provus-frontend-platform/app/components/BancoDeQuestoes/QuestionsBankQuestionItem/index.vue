<script setup lang="ts">
import type { IQuestionListItem } from "@/types/QuestionBank";
import Item from "@/components/BancoDeQuestoes/QuestionsBankItem/index.vue";

defineProps<{
  item: IQuestionListItem;
}>();

function formatarData(data: Date | undefined): string {
  if (!data) return "sem data";
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<template>
  <Item :id="String(item.data.id)">
    <div
      class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
    >
      <Icon name="i-lucide-file-question" class="text-blue-600 text-lg" />
    </div>

    <div class="flex-1">
      <h3 class="font-medium text-gray-900">{{ item.data.titulo }}</h3>
      <p class="text-sm text-gray-600 mt-1">{{ item.data.descricao }}</p>

      <div class="flex items-center space-x-4 mt-2">
        <UBadge size="sm">{{ item.data.tipo.label }}</UBadge>
        <span class="text-xs text-gray-500"
          >Modified {{ formatarData(item.data.atualizadoEm) }}</span
        >
      </div>
    </div>
  </Item>
</template>
