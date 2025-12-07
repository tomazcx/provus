<script setup lang="ts">
import { useGlobalLoadingStore } from "~/store/globalLoadingStore";

const globalLoadingStore = useGlobalLoadingStore();
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="globalLoadingStore.isLoading"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <Icon
          name="i-lucide-loader-2"
          class="w-10 h-10 text-primary animate-spin"
        />
        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
          Processando...
        </span>
      </div>
    </div>
  </Transition>
</template>