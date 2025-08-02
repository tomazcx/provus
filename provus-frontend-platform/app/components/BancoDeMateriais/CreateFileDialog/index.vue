<script setup lang="ts">
import FileForm from "@/components/BancoDeMateriais/FileForm/index.vue";
import type { IFile } from "~/types/IFile";

defineProps<{ modelValue: boolean }>();

const emit = defineEmits(["update:modelValue", "create"]);

function handleFormSubmit(
  payload: Omit<IFile, "id" | "path" | "criadoEm" | "atualizadoEm">
) {
  emit("create", { formData: payload });
  emit("update:modelValue", false);
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
