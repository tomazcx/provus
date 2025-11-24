<script setup lang="ts">
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

defineProps<{
  tituloAvaliacao: string | null;
  allowRetake: boolean;
}>();

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
      <div class="flex items-center space-x-4 flex-1 min-w-0 mr-4">
        <UButton
          color="white"
          variant="soft"
          icon="i-lucide-arrow-left"
          class="shrink-0"
          @click="router.back()"
        >
          Voltar
        </UButton>
        <div
          class="border-l border-white border-opacity-30 pl-4 flex-1 min-w-0"
        >
          <h1 class="text-xl font-bold">Revisão da Avaliação</h1>

          <div class="text-sm opacity-90 max-h-[2.5rem] overflow-hidden">
            <RichTextEditor
              :model-value="tituloAvaliacao ?? 'Carregando...'"
              disabled
              min-height=""
              class="!p-0 !bg-transparent !border-none pointer-events-none text-white/90"
            />
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-3 shrink-0">
        <UButton
          v-if="allowRetake"
          color="white"
          variant="outline"
          @click="retakeTest"
        >
          <Icon name="i-lucide-refresh-cw" class="mr-2 h-4 w-4" /> Refazer
          Avaliação
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.prose p) {
  margin: 0;
}
:deep(.prose) {
  color: inherit;
}
:deep(.prose strong) {
  color: inherit;
}
</style>
