<script setup lang="ts">
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

defineProps<{
  tituloAvaliacao: string;
  tempoRestanteFormatado?: string | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits(["submit"]);
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 bg-white text-primary px-6 py-3 flex items-center justify-between z-50 shadow-lg"
  >
    <div class="flex items-center space-x-4 flex-1 min-w-0 mr-4">
      <div class="bg-opacity-20 rounded-lg px-3 py-1 shrink-0 bg-primary/5">
        <div class="font-semibold max-h-[3rem] overflow-hidden">
          <RichTextEditor
            :model-value="tituloAvaliacao"
            disabled
            min-height=""
            class="!p-0 !bg-transparent !border-none pointer-events-none text-primary"
          />
        </div>
      </div>
      <span class="text-sm opacity-90 shrink-0">Prof. Responsável</span>
    </div>

    <div class="flex items-center space-x-6 shrink-0">
      <div class="flex items-center space-x-2">
        <Icon name="i-lucide-clock" />
        <span class="font-mono text-lg font-semibold">{{
          tempoRestanteFormatado ?? "--:--:--"
        }}</span>
      </div>
      <UButton
        color="secondary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="emit('submit')"
      >
        <Icon v-if="!isSubmitting" name="i-lucide-send" class="mr-2" />
        Entregar Avaliação
      </UButton>
    </div>
  </div>
</template>

<style scoped>
:deep(.prose p) {
  margin: 0;
}
</style>
