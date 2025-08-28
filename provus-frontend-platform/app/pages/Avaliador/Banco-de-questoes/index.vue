<script setup lang="ts">
import { onMounted } from "vue";
import QuestionBankContent from "@/components/BancoDeQuestoes/QuestionBankContent/index.vue";
import { useQuestionBankStore } from "~/store/questionBankstore";

const questionBankStore = useQuestionBankStore();

onMounted(() => {
  questionBankStore.initialize();
});

const pageTitle = "Banco de Questões";
</script>

<template>
  <div>
    <div>
      <h1 class="text-3xl font-bold text-primary">{{ pageTitle }}</h1>
      <p v-if="pageTitle === 'Banco de Questões'" class="text-gray-600 mt-1">
        Organize e gerencie seu banco de questões
      </p>
    </div>

    <QuestionBankContent />
  </div>
</template>
