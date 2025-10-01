<script setup lang="ts">
import ExamBankContent from "@/components/BancoDeAvaliacoes/ExamBankContent/index.vue";
import { useExamBankStore } from "~/store/assessmentBankStore";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "save-here"]);

const examBankStore = useExamBankStore();

function saveAssessmentHere() {
  emit("save-here", examBankStore.currentFolderId);
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
      <ExamBankContent mode="browse" />
    </template>
    <template #footer>
      <div class="flex justify-end gap-4 w-full">
        <UButton variant="ghost" @click="$emit('update:modelValue', false)"
          >Cancelar</UButton
        >
        <UButton color="primary" @click="saveAssessmentHere">
          <Icon name="i-lucide-save" class="mr-2" /> Salvar aqui
        </UButton>
      </div>
    </template>
  </UModal>
</template>
