<script setup lang="ts">
import Item from "@/components/ui/BankItem/index.vue";
import type { FolderEntity } from "~/types/entities/Item.entity";

defineProps<{
  item: FolderEntity; 
  isSelected?: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits(["edit", "delete", "select"]);

function formatDate(date: Date): string {
  if (!date) return "";
  return date.toLocaleDateString("pt-BR", {
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
      class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
    >
      <Icon name="i-lucide-folder" class="text-yellow-600 text-lg" />
    </div>

    <div>
      <h3 class="font-medium text-gray-900">{{ item.titulo }}</h3>
      <p class="text-sm text-gray-600">
        Modificado em {{ formatDate(item.atualizadoEm) }}
      </p>
    </div>
  </Item>
</template>
