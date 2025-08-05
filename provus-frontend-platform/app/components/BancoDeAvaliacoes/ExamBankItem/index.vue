<script setup lang="ts">
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import Item from "@/components/ui/BankItem/index.vue";

defineProps<{
  item: IAvaliacaoImpl;
  isSelected?: boolean;
}>();

const emit = defineEmits(["edit", "delete"]);
</script>

<template>
  <Item
    :id="String(item.id)"
    :class="{ '!bg-primary/10': isSelected }"
    @edit="emit('edit')"
    @delete="emit('delete')"
  >
    <div
      class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
    >
      <Icon name="i-lucide-clipboard-list" class="text-purple-600 text-lg" />
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-medium text-gray-900 truncate">{{ item.titulo }}</h3>
      <p v-if="item.descricao" class="text-sm text-gray-600 mt-1 truncate">
        {{ item.descricao }}
      </p>

      <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <Icon name="i-lucide-file-question" class="h-4 w-4" />
          <span>{{ item.questoes.length }} questões</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon name="i-lucide-star" class="h-4 w-4" />
          <span>{{ item.pontuacao }} pontos</span>
        </div>
      </div>
    </div>
  </Item>
</template>
