<script setup lang="ts">
import type { IFolder } from "~/types/IBank";

const props = defineProps<{
  modelValue: boolean;
  folder: IFolder | null; 
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update", payload: { newTitle: string }): void;
}>();

const form = reactive({
  titulo: "",
});

watch(
  () => props.folder,
  (newFolder) => {
    if (newFolder) {
      form.titulo = newFolder.titulo;
    }
  },
  { immediate: true }
);

function confirmUpdate() {
  if (form.titulo.trim() === "" || form.titulo === props.folder?.titulo) {
    emit("update:modelValue", false);
    return;
  }
  emit("update", { newTitle: form.titulo });
  emit("update:modelValue", false);
}
</script>

<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-folder-pen" class="text-white text-xl" />
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">Editar Pasta</h3>
          <p class="text-sm text-gray-600">
            Altere o nome da pasta selecionada.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <UFormField label="Novo nome da Pasta" class="w-full">
        <UInput
          v-model="form.titulo"
          placeholder="Digite o novo nome da pasta..."
          class="w-full"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex flex-row-reverse gap-4 w-full">
        <UButton variant="solid" color="primary" @click="confirmUpdate">
          Salvar Alterações
        </UButton>
        <UButton variant="outline" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
