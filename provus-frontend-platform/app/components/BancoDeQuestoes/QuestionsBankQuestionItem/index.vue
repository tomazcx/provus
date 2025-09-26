<script setup lang="ts">
import Item from "@/components/ui/BankItem/index.vue";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";

defineProps<{
  item: QuestaoEntity; 
  isSelected?: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits(["edit", "delete", "select"]);

function formatDate(dateString: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>

<template>
  <Item
    :id="String(item.id)"
    :class="{ '!bg-primary/10': isSelected }"
    @edit="emit('edit')"
    @delete="emit('delete')"
  >
    <div v-if="selectable" class="flex items-center pr-2" @click.stop>
      <UCheckbox
        :model-value="isSelected"
        @update:model-value="emit('select', item)"
      />
    </div>

    <div
      class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
    >
      <Icon name="i-lucide-file-question" class="text-blue-600 text-lg" />
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-medium text-gray-900 truncate">{{ item.titulo }}</h3>
      <p class="text-sm text-gray-600 mt-1 truncate">{{ item.descricao }}</p>

      <div class="flex items-center space-x-4 mt-2">
        <UBadge size="sm">{{ item.tipoQuestao }}</UBadge>
        <span class="text-xs text-gray-500"
          >Modificado {{ formatDate(item.atualizadoEm) }}</span
        >
      </div>
    </div>
  </Item>
</template>
