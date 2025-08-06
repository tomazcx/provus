<script setup lang="ts">
import MaterialsBankFileItem from "~/components/BancoDeMateriais/MaterialsBankFileItem/index.vue";
import type { IFile } from "~/types/IFile";

defineProps<{
  modelValue: boolean;
  selectedMaterials: IFile[];
}>();

const emit = defineEmits([
  "update:modelValue",
  "remove-material",
  "edit-material",
]);

function handleRemove(file: IFile) {
  emit("remove-material", file.id);
}

function handleEdit(file: IFile) {
  emit("edit-material", file);
}
</script>

<template>
  <UModal
    :open="modelValue"
    title="Materiais Anexados"
    description="Veja e gerencie os materiais de consulta para esta avaliação."
    class="min-w-3xl"
    @update:open="emit('update:modelValue', $event)"
  >
    <template #body>
      <div class="max-h-96 overflow-y-auto">
        <p v-if="selectedMaterials.length === 0" class="text-sm text-gray-500">
          Nenhum material anexado.
        </p>
        <div v-else class="space-y-2">
          <MaterialsBankFileItem
            v-for="file in selectedMaterials"
            :key="file.id"
            :item="file"
            @delete="handleRemove(file)"
            @edit="handleEdit(file)"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton
          color="primary"
          variant="ghost"
          @click="emit('update:modelValue', false)"
        >
          Fechar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
