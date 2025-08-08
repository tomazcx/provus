import type { ISubmissao, ISubmissaoResponse } from "~/types/ISubmissao";

export const useSubmissionsStore = defineStore("submissions", () => {
  const response = ref<ISubmissaoResponse | null>(null);
  const isLoading = ref(false);

  async function fetchSubmissions(applicationId: number) {
    isLoading.value = true;
    response.value = null;

    try {
      const { mockSubmissionResponse } = await import(
        "~/mock/mockSubmissionResponse"
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (mockSubmissionResponse.applicationId === applicationId) {
        response.value = mockSubmissionResponse;
      } else {
        console.warn(
          `Nenhuma submissão encontrada para a aplicação com ID: ${applicationId}`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar submissões:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function getSubmissionById(id: number): ISubmissao | undefined {
    if (!response.value || !response.value.submissoes) {
      return undefined;
    }
    return response.value.submissoes.find((sub) => sub.id === id);
  }

  const submissions = computed(() => response.value || null);

  return {
    response,
    submissions,
    isLoading,
    fetchSubmissions,
    getSubmissionById,
  };
});
