<script setup lang="ts">
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import Item from "@/components/ui/BankItem/index.vue";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

defineProps<{
  item: AvaliacaoEntity;
  isSelected?: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits(["edit", "delete", "apply", "schedule", "select"]);
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
      class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center self-start mt-1"
    >
      <Icon name="i-lucide-clipboard-list" class="text-purple-600 text-lg" />
    </div>

    <div class="flex-1 min-w-0 overflow-hidden">
      <div
        class="font-medium text-gray-900 max-h-[1.5rem] overflow-hidden leading-snug"
      >
        <RichTextEditor
          :model-value="item.titulo"
          disabled
          min-height=""
          class="!p-0 !border-none !bg-transparent pointer-events-none"
        />
      </div>

      <div
        v-if="item.descricao"
        class="mt-1 max-h-[1.25rem] overflow-hidden opacity-75"
      >
        <RichTextEditor
          :model-value="item.descricao"
          disabled
          min-height=""
          class="!p-0 !border-none !bg-transparent pointer-events-none text-sm"
        />
      </div>

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

    <div class="ml-4 flex-shrink-0 flex flex-col sm:flex-row gap-2">
      <UTooltip text="Agendar para depois">
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-calendar-clock"
          @click.stop="emit('schedule')"
        />
      </UTooltip>
      <UTooltip text="Aplicar agora">
        <UButton
          color="secondary"
          icon="i-lucide-send"
          @click.stop="emit('apply')"
        />
      </UTooltip>
    </div>
  </Item>
</template>

<style scoped>
:deep(.prose p) {
  margin: 0;
}
</style>
