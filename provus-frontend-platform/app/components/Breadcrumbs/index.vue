<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

export interface CustomBreadcrumbItem extends BreadcrumbItem {
  click?: () => void;
}

defineProps<{
  items: CustomBreadcrumbItem[];
}>();
</script>

<template>
  <div v-if="items.length > 0" class="mb-6">
    <UBreadcrumb :items="items">
      <template #item="{ item, index }">
        <div
          class="flex items-center gap-1 max-w-[200px] sm:max-w-xs md:max-w-md truncate breadcrumb-item-wrapper"
        >
          <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4 shrink-0" />

          <NuxtLink
            v-if="!item.disabled && item.to && index !== items.length - 1"
            :to="item.to"
            class="hover:text-primary transition-colors truncate flex items-center"
          >
            <RichTextEditor
              :model-value="item.label"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none inline-rich-text"
            />
          </NuxtLink>

          <span
            v-else-if="
              !item.disabled && item.click && index !== items.length - 1
            "
            class="cursor-pointer hover:text-primary transition-colors truncate flex items-center"
            @click="item.click()"
          >
            <RichTextEditor
              :model-value="item.label"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none inline-rich-text"
            />
          </span>

          <span
            v-else
            class="text-gray-500 font-medium cursor-default truncate flex items-center"
          >
            <RichTextEditor
              :model-value="item.label"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none inline-rich-text"
            />
          </span>
        </div>
      </template>
    </UBreadcrumb>
  </div>
</template>

<style scoped>
:deep(.inline-rich-text),
:deep(.inline-rich-text > div) {
  display: inline-flex !important;
  align-items: center;
  min-width: 0;
}

:deep(.inline-rich-text .ProseMirror),
:deep(.inline-rich-text .prose),
:deep(.inline-rich-text p) {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}

:deep(.inline-rich-text span[data-type="math"]) {
  display: inline-block;
  vertical-align: middle;
}

:deep(.inline-rich-text .ProseMirror) {
  overflow: hidden !important;
}
</style>
