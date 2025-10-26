import type {
  FindSubmissoesResponse,
  SubmissaoNaListaResponse,
} from "~/types/api/response/FindSubmissoes.response";

export const useSubmissionsStore = defineStore("submissions", () => {
  const response = ref<FindSubmissoesResponse | null>(null);
  const isLoading = ref(false);
  const { $api } = useNuxtApp();
  const toast = useToast();

  async function fetchSubmissions(applicationId: number) {
    isLoading.value = true;
    response.value = null;
    try {
      const data = await $api<FindSubmissoesResponse>(
        `/backoffice/aplicacao/${applicationId}/submissoes`,
        { method: "GET" }
      );
      response.value = data;
    } catch (error: unknown) {
      console.error("Erro ao buscar submissões:", error);
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data === "object" &&
        (error as { data?: { message?: string } }).data !== null &&
        "message" in (error as { data?: { message?: string } }).data!
      ) {
        errorMessage =
          (
            (error as { data?: { message?: string } }).data as {
              message?: string;
            }
          ).message ??
          "Ocorreu um erro desconhecido ao buscar dados da revisão.";
      }
      toast.add({
        title: "Erro ao buscar submissões",
        description: errorMessage,
        color: "error",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function getSubmissionById(id: number): SubmissaoNaListaResponse | undefined {
    if (!response.value?.submissoes) {
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
