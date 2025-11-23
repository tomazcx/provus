<script setup lang="ts">
import Item from "@/components/ui/BankItem/index.vue";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

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
      class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center self-start mt-1"
    >
      <Icon name="i-lucide-file-question" class="text-blue-600 text-lg" />
    </div>
    <div class="flex-1 min-w-0 overflow-hidden">
      <div class="font-medium text-gray-900">
        <RichTextEditor
          v-if="item.titulo"
          :model-value="item.titulo"
          disabled
          class="!p-0 line-clamp-1 [&_p]:!m-0 [&_ul]:!m-0 [&_li]:!m-0 [&_ul]:!pl-0 [&_li]:!list-none"
        />
        <span v-else class="italic text-gray-400">Sem título</span>
      </div>
      <div class="mt-1 max-h-[3rem] overflow-hidden relative mask-linear-fade">
        <RichTextEditor
          v-if="item.descricao"
          :model-value="item.descricao"
          disabled
          class="!p-0"
        />
        <p v-else class="text-sm text-gray-500">Sem descrição</p>

        <div
          class="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent dark:from-gray-900 pointer-events-none"
        />
      </div>
      <div class="flex items-center space-x-4 mt-2">
        <UBadge size="sm">{{ item.tipoQuestao }}</UBadge>
        <span class="text-xs text-gray-500"
          >Modificado {{ formatDate(item.atualizadoEm) }}</span
        >
      </div>
    </div>
  </Item>
</template>

<style scoped>
:deep(.ProseMirror) {
  padding: 0 !important;
  min-height: auto !important;
}
:deep(.prose p) {
  margin-top: 0;
  margin-bottom: 0.25rem;
}
</style>
