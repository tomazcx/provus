<script setup lang="ts">
import DateTimePicker from "@/components/ui/DateTimePicker/index.vue";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";

const props = defineProps<{
  modelValue: boolean;
  avaliacao: AvaliacaoEntity | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "schedule", payload: { date: Date }): void;
}>();

const toast = useToast();
const selectedDate = ref<Date | null>(null);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      selectedDate.value = tomorrow;
    }
  }
);

function handleConfirm() {
  if (!selectedDate.value) {
    toast.add({
      title: "Data Obrigatória",
      description: "Por favor, selecione uma data e hora para o agendamento.",
      color: "warning",
      icon: "i-lucide-calendar-x",
    });
    return;
  }

  if (selectedDate.value <= new Date()) {
    toast.add({
      title: "Data Inválida",
      description: "A data de agendamento deve ser no futuro.",
      color: "warning",
      icon: "i-lucide-clock",
    });
    return;
  }

  emit("schedule", { date: selectedDate.value });
  emit("update:modelValue", false);
}
</script>

<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
        >
          <Icon
            name="i-lucide-calendar-clock"
            class="text-purple-600 text-2xl"
          />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Agendar Aplicação</h2>
          <p class="text-sm text-gray-500">
            Defina quando esta avaliação estará disponível.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-6 py-2">
        <UCard variant="subtle" class="bg-gray-50">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-500 uppercase mb-1"
              >Avaliação Selecionada</span
            >
            <span class="font-medium text-gray-900">{{
              avaliacao?.titulo || "Carregando..."
            }}</span>
          </div>
        </UCard>

        <UFormField label="Data e Hora do Início" required>
          <DateTimePicker
            v-model="selectedDate"
            :enable-date="true"
            :enable-time="true"
          />
          <p class="text-xs text-gray-500 mt-2">
            A avaliação iniciará automaticamente nesta data. O link de acesso
            pode ser compartilhado antes, mas o acesso será bloqueado até o
            horário.
          </p>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <UButton
          variant="ghost"
          color="primary"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-calendar-check-2"
          @click="handleConfirm"
        >
          Confirmar Agendamento
        </UButton>
      </div>
    </template>
  </UModal>
</template>
