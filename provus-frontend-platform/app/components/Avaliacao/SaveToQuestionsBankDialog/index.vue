<script setup lang="ts">
import QuestionBankContent from "@/components/BancoDeQuestoes/QuestionBankContent/index.vue";
import { useQuestionBankStore } from "~/store/questionBankstore";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type { CreateQuestaoRequest } from "~/types/api/request/Questao.request";

const props = defineProps<{
  modelValue: boolean;
  questionToSave: QuestaoEntity | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const questionBankStore = useQuestionBankStore();

function saveQuestionHere() {
  if (!props.questionToSave) return;

  questionBankStore.createQuestion(
    props.questionToSave as CreateQuestaoRequest
  );

  emit("update:modelValue", false);
}
</script>

<template>
  <UModal
    title="Banco de questões"
    description="Selecione o lugar no qual deseja salvar essa questão"
    :open="modelValue"
    class="min-w-6xl min-h-[900px]"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <QuestionBankContent :items="questionBankStore.items" />
    </template>
    <template #footer>
      <div class="flex justify-end gap-4 w-full">
        <UButton variant="ghost" @click="$emit('update:modelValue', false)"
          >Cancelar</UButton
        >
        <UButton color="primary" @click="saveQuestionHere">
          <Icon name="i-lucide-save" class="mr-2" /> Salvar aqui
        </UButton>
      </div>
    </template>
  </UModal>
</template>
