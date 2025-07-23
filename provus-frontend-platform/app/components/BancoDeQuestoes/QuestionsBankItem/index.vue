<script setup lang="ts">
import type { ContextMenuItem } from "@nuxt/ui";

defineProps<{
  id: string;
}>();

const items = ref<ContextMenuItem[]>([
  {
    label: "Editar",

    icon: "i-lucide-pencil",
  },

  {
    label: "Deletar",

    icon: "i-lucide-trash",
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
        />
      </UDropdownMenu>
    </div>
  </UCard>
</template>
