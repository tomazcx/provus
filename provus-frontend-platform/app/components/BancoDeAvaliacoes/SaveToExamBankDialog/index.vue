<script setup lang="ts">
import ExamBankContent from "@/components/BancoDeAvaliacoes/ExamBankContent/index.vue";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save-here"]);

const currentPathInBank = ref("/");

function saveAssessmentHere() {
  emit("save-here", currentPathInBank.value);
}
</script>

<template>
  <UModal
    title="Salvar no Banco de Avaliações"
    description="Selecione a pasta onde deseja salvar este modelo de avaliação"
    :open="modelValue"
    class="min-w-6xl"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <ExamBankContent
        @path-changed="(newPath) => (currentPathInBank = newPath)"
      />
    </template>

    <template #footer>
      <div class="flex justify-end gap-4 w-full">
        <UButton variant="ghost" @click="$emit('update:modelValue', false)">
          Cancelar
        </UButton>
        <UButton color="primary" @click="saveAssessmentHere">
          <Icon name="i-lucide-save" class="mr-2" /> Salvar aqui
        </UButton>
      </div>
    </template>
  </UModal>
</template>
