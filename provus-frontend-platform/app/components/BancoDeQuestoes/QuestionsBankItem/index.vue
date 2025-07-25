<script setup lang="ts">
import type { ContextMenuItem } from "@nuxt/ui";

const emit = defineEmits(["edit", "delete"]);

const items = ref<ContextMenuItem[]>([
  {
    label: "Editar",

    icon: "i-lucide-pencil",
    onSelect: () => emit("edit"),
  },

  {
    label: "Deletar",

    icon: "i-lucide-trash",
    onSelect: () => emit("delete"),
  },
]);
</script>

<template>
  <UCard flat>
    <div class="flex items-center justify-between p-2">
      <div class="flex items-center space-x-4">
        <slot />
      </div>

      <UDropdownMenu
        :items="items"
        :ui="{
          content: 'w-48',
        }"
      >
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          @click.stop
        />
        <template #item="{ item }">
          <span
            :class="
              item.label === 'Deletar'
                ? 'text-red-500 group-hover:text-red-600'
                : ''
            "
          >
            {{ item.label }}
          </span>
        </template>
      </UDropdownMenu>
    </div>
  </UCard>
</template>
