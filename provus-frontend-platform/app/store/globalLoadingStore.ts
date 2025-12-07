import { defineStore } from "pinia";

export const useGlobalLoadingStore = defineStore("globalLoading", () => {
  const activeRequests = ref(0);

  const isLoading = computed(() => activeRequests.value > 0);

  function startLoading() {
    activeRequests.value++;
  }

  function finishLoading() {
    if (activeRequests.value > 0) {
      activeRequests.value--;
    }
  }

  function reset() {
    activeRequests.value = 0;
  }

  return {
    isLoading,
    startLoading,
    finishLoading,
    reset,
  };
});
