<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "create", payload: { titulo: string }): void;
}>();

const form = reactive({
  titulo: "",
});

function confirmCreate() {
  if (form.titulo.trim() === "") return;
  emit("create", { titulo: form.titulo });
  emit("update:modelValue", false); // Fecha o modal
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      form.titulo = "";
    }
  }
);
</script>

<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-folder-plus" class="text-white text-xl" />
        </div>

        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">Criar Nova Pasta</h3>
          <p class="text-sm text-gray-600">Organize suas questões em pastas</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Nome da Pasta" class="w-full">
          <UInput
            v-model="form.titulo"
            placeholder="Digite o nome da pasta..."
            class="w-full"
          />
        </UFormField>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <Icon name="i-lucide-info" class="text-blue-500 mt-0.5" />
            <div>
              <p class="text-sm text-blue-700">
                <span class="font-medium">Localização atual:</span> Banco de
                Questões &gt; Matemática &gt; Ensino Médio
              </p>
              <p class="text-xs text-blue-600 mt-1">
                A nova pasta será criada neste local
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="bg-gray-50 flex flex-row-reverse gap-4 w-full">
        <UButton variant="solid" color="primary" @click="confirmCreate">
          <Icon name="i-lucide-plus" class="mr-2" /> Criar Pasta
        </UButton>
        <UButton variant="outline" @click="close"> Cancelar </UButton>
      </div>
    </template>
  </UModal>
</template>
