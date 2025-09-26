<script setup lang="ts">
import QuestionForm from "@/components/BancoDeQuestoes/QuestionForm/index.vue";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { UpdateQuestaoRequest } from "~/types/api/request/Questao.request";

const props = defineProps<{
  modelValue: boolean;
  question: QuestaoEntity | null;
}>();

const emit = defineEmits(["update:modelValue", "update:question"]);

function handleFormSubmit(payload: UpdateQuestaoRequest) {
  emit("update:question", payload);
  emit("update:modelValue", false);
}
</script>

<template>
  <UModal
    class="min-w-6xl"
    title="Editar Questão"
    description="Atualize sua questão com novos dados"
    :open="modelValue"
    :closeable="true"
    :keyboard="true"
    :closable="true"
    :ui="{ body: 'flex flex-col' }"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <QuestionForm :initial-data="props.question" @submit="handleFormSubmit" />
    </template>
    <template #footer>
      <div class="w-full flex flex-row-reverse justify-start gap-4">
        <UButton type="submit" form="question-form" color="primary"
          >Atualizar Questão</UButton
        >
        <UButton variant="ghost" @click="$emit('update:modelValue', false)"
          >Cancelar</UButton
        >
      </div>
    </template>
  </UModal>
</template>
