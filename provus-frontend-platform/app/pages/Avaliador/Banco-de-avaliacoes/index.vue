<script setup lang="ts">
import ExamBankContent from "@/components/BancoDeAvaliacoes/ExamBankContent/index.vue";

const pageTitle = "Banco de Avaliações";
</script>

<template>
  <div>
    <div>
      <h1 class="text-3xl font-bold text-primary">{{ pageTitle }}</h1>
      <p v-if="pageTitle === 'Banco de Avaliações'" class="text-gray-600 mt-1">
        Organize e gerencie seu banco de avaliações
      </p>
    </div>

    <ExamBankContent />
  </div>
</template>
