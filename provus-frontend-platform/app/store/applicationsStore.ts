import type { IAplicacao } from "~/types/IAplicacao";

export const useApplicationsStore = defineStore("applications", () => {
  const applications = ref<IAplicacao[]>([]);
  const isLoading = ref(false);

  async function fetchItems() {
    if (applications.value.length > 0) return;

    isLoading.value = true;
    try {
      const { mockApplicationsResponse } = await import(
        "~/mock/mockApplicationsResponse"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      applications.value = mockApplicationsResponse;
    } catch (error) {
      console.error("Erro ao buscar aplicações:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function getApplicationById(id: number) {
    return applications.value.find((app) => app.id === id);
  }

  return {
    applications,
    isLoading,
    fetchItems,
    getApplicationById,
  };
});
