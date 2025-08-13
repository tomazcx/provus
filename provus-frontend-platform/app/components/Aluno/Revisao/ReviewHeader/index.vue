<script setup lang="ts">
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";

defineProps<{ avaliacao: IAvaliacaoImpl }>();
const router = useRouter();

function retakeTest() {
  router.push("/aluno/entrar");
}
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 bg-primary text-white px-6 py-4 z-50 shadow-lg"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <UButton
          color="white"
          variant="soft"
          icon="i-lucide-arrow-left"
          @click="router.back()"
        >
          Voltar
        </UButton>
        <div class="border-l border-white border-opacity-30 pl-4">
          <h1 class="text-xl font-bold">Revisão da Avaliação</h1>
          <p class="text-sm opacity-90">{{ avaliacao.titulo }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <UButton color="white" variant="outline" @click="retakeTest">
          <Icon name="i-lucide-refresh-cw" class="mr-2" />
          Refazer Avaliação
        </UButton>
      </div>
    </div>
  </div>
</template>
