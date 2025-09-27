<script setup lang="ts">
import FileForm from "@/components/BancoDeMateriais/FileForm/index.vue";
import type { UpdateArquivoRequest } from "~/types/api/request/Arquivo.request";

defineProps<{ modelValue: boolean }>();

const emit = defineEmits(["update:modelValue", "create"]);

function handleFormSubmit(payload: FormData | UpdateArquivoRequest) {
  if (payload instanceof FormData) {
    emit("create", payload);
    emit("update:modelValue", false);
  } else {
    console.error("CreateFileDialog recebeu um tipo de payload inesperado para uma criação.");
  }
}

</script>

<template>
  <UModal
    class="min-w-4xl"
    title="Novo Arquivo de Material"
    description="Faça o upload e adicione detalhes ao seu novo material"
    :open="modelValue"
    :ui="{ body: 'flex flex-col' }"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <FileForm @submit="handleFormSubmit" />
    </template>

    <template #footer>
      <div class="flex flex-row-reverse gap-4 w-full">
        <UButton type="submit" form="file-form" color="primary">
          Salvar Material
        </UButton>
        <UButton variant="ghost" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
