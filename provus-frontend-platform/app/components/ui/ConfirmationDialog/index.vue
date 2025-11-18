<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmColor?:
    | "error"
    | "primary"
    | "white"
    | "black"
    | "secondary"
    | "gray"
    | "success"
    | "warning"
    | "info"
    | "primary-light"
    | "primary-dark"
    | "secondary-light"
    | "secondary-dark"
    | "neutral";
}>();

const emit = defineEmits(["update:modelValue", "confirm"]);

const localModel = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const onConfirm = () => {
  emit("confirm");
  localModel.value = false;
};
</script>

<template>
  <UModal :open="modelValue" @update:open="emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center"
        >
          <Icon
            name="i-lucide-alert-triangle"
            class="text-warning-500 text-2xl"
          />
        </div>
        <div>
          <h2 class="text-xl font-bold">{{ props.title }}</h2>
        </div>
      </div>
    </template>

    <template #body>
      <p class="text-gray-600">{{ props.description }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="primary" variant="ghost" @click="localModel = false">
          Cancelar
        </UButton>
        <UButton :color="props.confirmColor || 'warning'" @click="onConfirm">
          {{ props.confirmLabel || "Confirmar" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
