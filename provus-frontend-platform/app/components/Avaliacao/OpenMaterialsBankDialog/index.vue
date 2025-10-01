<script setup lang="ts">
import MaterialsBankContent from "@/components/BancoDeMateriais/MaterialsBankContent/index.vue";
import { useMaterialsBankStore } from "~/store/materialsBankStore";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import type { ItemEntity } from "~/types/entities/Item.entity";
import isFolder from "~/guards/isFolder";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "add-materials",
    payload: {
      files: ArquivoEntity[];
      rawSelection: { folders: number[]; files: number[] };
    }
  ): void;
}>();

const materialsBankStore = useMaterialsBankStore();

const materialsContentRef = ref<InstanceType<
  typeof MaterialsBankContent
> | null>(null);

function addSelectedMaterials() {
  const selection = materialsContentRef.value?.selectedItems;
  if (
    !selection ||
    (selection.folders.size === 0 && selection.files.size === 0)
  ) {
    emit("update:modelValue", false);
    return;
  }

  const finalFileIds = new Set<number>(selection.files);

  selection.folders.forEach((folderId: number) => {
    const folder = materialsBankStore.items.find((i) => i.id === folderId);
    if (folder && isFolder(folder)) {
      const pathPrefix =
        folder.path === "/"
          ? `/${folder.titulo}`
          : `${folder.path}/${folder.titulo}`;

      materialsBankStore.items.forEach((item: ItemEntity) => {
        if (item.path?.startsWith(pathPrefix) && !isFolder(item)) {
          finalFileIds.add(item.id!);
        }
      });
    }
  });

  const filesToAdd = materialsBankStore.items.filter(
    (item) => item.id && finalFileIds.has(item.id)
  ) as ArquivoEntity[];

  const fileClones = JSON.parse(JSON.stringify(filesToAdd));

  emit("add-materials", {
    files: fileClones,
    rawSelection: {
      folders: Array.from(selection.folders),
      files: Array.from(selection.files),
    },
  });

  emit("update:modelValue", false);
}
</script>

<template>
  <UModal
    :open="modelValue"
    title="Banco de Materiais"
    description="Selecione os arquivos ou pastas que deseja anexar à avaliação"
    class="min-w-6xl"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <MaterialsBankContent ref="materialsContentRef" mode="select" />
    </template>

    <template #footer>
      <div class="flex flex-row-reverse gap-4 w-full">
        <UButton variant="solid" color="primary" @click="addSelectedMaterials">
          <Icon name="i-lucide-plus" class="mr-2" /> Adicionar itens
        </UButton>
        <UButton variant="outline" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
