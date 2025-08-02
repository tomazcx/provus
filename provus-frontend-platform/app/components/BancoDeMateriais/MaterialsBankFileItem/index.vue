<script setup lang="ts">
import Item from "@/components/ui/BankItem/index.vue";
import type { IFile } from "~/types/IFile";
import TipoArquivoEnum from "~/enums/TipoArquivoEnum";

const props = defineProps<{
  item: IFile;
  isSelected?: boolean;
}>();

const emit = defineEmits(["edit", "delete"]);

const fileTypeVisuals = computed(() => {
  const visuals: Record<TipoArquivoEnum, { icon: string; color: string }> = {
    [TipoArquivoEnum.PDF]: {
      icon: "i-lucide-file-type-2",
      color: "text-red-600 bg-red-100",
    },
    [TipoArquivoEnum.DOCX]: {
      icon: "i-lucide-file-text",
      color: "text-blue-600 bg-blue-100",
    },
    [TipoArquivoEnum.PPTX]: {
      icon: "i-lucide-file-sliders",
      color: "text-orange-600 bg-orange-100",
    },
    [TipoArquivoEnum.TXT]: {
      icon: "i-lucide-file-code-2",
      color: "text-gray-600 bg-gray-100",
    },
    [TipoArquivoEnum.OUTRO]: {
      icon: "i-lucide-file-question",
      color: "text-gray-600 bg-gray-100",
    },
  };
  return visuals[props.item.tipo as TipoArquivoEnum] || visuals[TipoArquivoEnum.OUTRO];
});

function formatBytes(bytes: number = 0, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
</script>

<template>
  <Item
    :id="String(item.id)"
    :class="{ '!bg-primary/10': isSelected }"
    @edit="emit('edit')"
    @delete="emit('delete')"
  >
    <div
      :class="fileTypeVisuals.color"
      class="w-10 h-10 rounded-lg flex items-center justify-center"
    >
      <Icon :name="fileTypeVisuals.icon" class="text-lg" />
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-medium text-gray-900 truncate">{{ item.titulo }}</h3>
      <p v-if="item.descricao" class="text-sm text-gray-600 mt-1 truncate">
        {{ item.descricao }}
      </p>

      <div class="flex items-center space-x-4 mt-2">
        <UBadge size="sm" variant="subtle">{{ item.tipo }}</UBadge>

        <span class="text-xs text-gray-500">
          {{ formatBytes(item.tamanhoEmBytes) }}
        </span>
      </div>
    </div>
  </Item>
</template>
