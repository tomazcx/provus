<script setup lang="ts">
import FileForm from "@/components/BancoDeMateriais/FileForm/index.vue";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";
import type { UpdateArquivoRequest } from "~/types/api/request/Arquivo.request";

const props = defineProps<{
  modelValue: boolean;
  file: ArquivoEntity | null;
}>();

const emit = defineEmits(["update:modelValue", "update:file"]);

function handleFormSubmit(payload: FormData | UpdateArquivoRequest) {
  if (!(payload instanceof FormData)) {
    emit("update:file", payload);
    emit("update:modelValue", false);
  } else {
    console.error("EditFileDialog recebeu um tipo de payload inesperado para uma edição.");
  }
}
</script>

<template>
  <UModal
    class="min-w-4xl"
    title="Editar Material"
    description="Atualize os detalhes do seu material"
    :open="modelValue"
    :ui="{ body: 'flex flex-col' }"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <FileForm :initial-data="props.file" @submit="handleFormSubmit" />
    </template>

    <template #footer>
      <div class="flex flex-row-reverse gap-4 w-full">
        <UButton type="submit" form="file-form" color="primary">
          Atualizar Material
        </UButton>
        <UButton variant="ghost" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
      </div>
    </template>
  </UModal>
</template>