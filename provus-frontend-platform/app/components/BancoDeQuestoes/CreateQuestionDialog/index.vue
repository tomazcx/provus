<script setup lang="ts">
import QuestionForm from "@/components/BancoDeQuestoes/QuestionForm/index.vue";
import type { TQuestionForm } from "~/types/IQuestao";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "create"]);

function handleFormSubmit(payload: TQuestionForm) {
  emit("create", payload);
}
</script>
<template>
  <UModal
    class="min-w-6xl"
    title="Criar Questão"
    description="Preencha os detalhes da nova questão"
    :open="modelValue"
    :closeable="true"
    :keyboard="true"
    :closable="true"
    :ui="{ body: 'flex flex-col' }"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <QuestionForm @submit="handleFormSubmit" />
    </template>
    <template #footer>
      <div class="flex flex-row-reverse gap-4 w-full">
        <UButton type="submit" form="question-form" color="primary"
          >Salvar Questão</UButton
        >
        <UButton variant="ghost" @click="$emit('update:modelValue', false)"
          >Cancelar</UButton
        >
      </div>
    </template>
  </UModal>
</template>
