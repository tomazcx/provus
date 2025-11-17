import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import type {
  SubmitRespostaRequestPayload,
  SubmitAvaliacaoRequestPayload,
} from "~/types/api/request/Submissao.request";
import type {
  FindSubmissaoByHashResponse,
  SubmissaoResponse,
  QuestaoSubmissaoResponse,
  ArquivoSubmissaoResponse,
} from "~/types/api/response/Submissao.response";

import type {
  FindSubmissaoRevisaoResponse,
  QuestaoRevisaoResponse,
} from "~/types/api/response/Revisao.response";

export type StudentAnswerData =
  | { texto: string }
  | { alternativaId: number | null | undefined }
  | { alternativasId: number[] };
export const useStudentAssessmentStore = defineStore("studentExam", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  const submissionDetails = ref<SubmissaoResponse | null>(null);
  const submissionQuestions = ref<QuestaoSubmissaoResponse[] | null>(null);
  const submissionFiles = ref<ArquivoSubmissaoResponse[] | null>(null);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  const dataInicioAplicacao = ref<string | null>(null);
  const tempoMaximoAvaliacao = ref<number | null>(null);
  const descricaoAvaliacao = ref<string | null>(null);
  const mostrarPontuacao = ref<boolean | null>(null);
  const permitirRevisao = ref<boolean | null>(null);
  const reviewQuestions = ref<QuestaoRevisaoResponse[] | null>(null);
  const quantidadeTentativas = ref<number | null>(null);

  const tituloAvaliacao = ref<string | null>(null);
  const nomeAvaliador = ref<string | null>(null);

  const proibirTrocarAbas = ref(false);
  const proibirPrintScreen = ref(false);
  const proibirCopiarColar = ref(false);
  const proibirDevtools = ref(false);
  const pontosPerdidos = ref(0);

  async function createStudentSubmission(
    nome: string,
    email: string,
    codigoAcesso: string
  ): Promise<string | null> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $api<SubmissaoResponse>(
        "/backoffice/encontrar-avaliacao",
        {
          method: "POST",
          body: {
            nome,
            email,
            codigoAcesso,
          },
        }
      );

      if (response && response.hash) {
        return response.hash;
      } else {
        throw new Error("Resposta inválida do servidor ao criar submissão.");
      }
    } catch (error: unknown) {
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
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao acessar a avaliação",
        description: errorMessage,
        color: "error",
      });

      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSubmissionDataByHash(hash: string): Promise<void> {
    submissionDetails.value = null;
    submissionQuestions.value = null;
    submissionFiles.value = null;
    dataInicioAplicacao.value = null;
    tempoMaximoAvaliacao.value = null;
    descricaoAvaliacao.value = null;
    mostrarPontuacao.value = null;
    permitirRevisao.value = null;
    tituloAvaliacao.value = null;
    nomeAvaliador.value = null;

    proibirTrocarAbas.value = false;
    proibirPrintScreen.value = false;
    proibirCopiarColar.value = false;
    proibirDevtools.value = false;
    pontosPerdidos.value = 0;

    isLoading.value = true;
    error.value = null;
    try {
      const response = await $api<FindSubmissaoByHashResponse>(
        `/backoffice/submissao/${hash}`
      );

      if (response) {
        submissionDetails.value = response.submissao;
        submissionQuestions.value = response.questoes;
        submissionFiles.value = response.arquivos;
        dataInicioAplicacao.value = response.dataInicioAplicacao;
        tempoMaximoAvaliacao.value = response.tempoMaximoAvaliacao;
        descricaoAvaliacao.value = response.descricaoAvaliacao;
        mostrarPontuacao.value = response.mostrarPontuacao;
        permitirRevisao.value = response.permitirRevisao;
        tituloAvaliacao.value = response.tituloAvaliacao;
        nomeAvaliador.value = response.nomeAvaliador;
        quantidadeTentativas.value = response.quantidadeTentativas ?? null;
        proibirTrocarAbas.value = response.proibirTrocarAbas ?? false;
        proibirPrintScreen.value = response.proibirPrintScreen ?? false;
        proibirCopiarColar.value = response.proibirCopiarColar ?? false;
        proibirDevtools.value = response.proibirDevtools ?? false;
      } else {
        throw new Error(
          "Resposta inválida do servidor ao buscar dados da submissão."
        );
      }
    } catch (error: unknown) {
      console.error("Erro ao buscar dados da submissão:", error);
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
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao acessar a avaliação",
        description: errorMessage,
        color: "error",
      });

      submissionDetails.value = null;
      submissionQuestions.value = null;
      submissionFiles.value = null;
      tituloAvaliacao.value = null;
      nomeAvaliador.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function submitStudentAnswers(
    answers: Record<number, StudentAnswerData | undefined | null>
  ): Promise<boolean> {
    if (!submissionDetails.value?.hash) {
      error.value = "Hash da submissão não encontrado para envio.";
      toast.add({
        title: "Erro Interno",
        description: error.value,
        color: "error",
      });
      return false;
    }

    isSubmitting.value = true;
    error.value = null;

    try {
      const respostasPayload: SubmitRespostaRequestPayload[] = Object.entries(
        answers
      )
        .filter(
          ([_, answerData]) => answerData !== undefined && answerData !== null
        )
        .map(([questaoIdStr, answerData]) => {
          const questaoId = parseInt(questaoIdStr, 10);
          const payload: Partial<SubmitRespostaRequestPayload> & {
            questaoId: number;
          } = { questaoId: questaoId };

          if (answerData && typeof answerData === "object") {
            if (
              "texto" in answerData &&
              typeof answerData.texto === "string" &&
              answerData.texto.trim() !== ""
            ) {
              payload.texto = answerData.texto;
            } else if (
              "alternativaId" in answerData &&
              (typeof answerData.alternativaId === "number" ||
                answerData.alternativaId === null)
            ) {
              payload.alternativa_id = answerData.alternativaId;
            } else if (
              "alternativasId" in answerData &&
              Array.isArray(answerData.alternativasId)
            ) {
              payload.alternativas_id = answerData.alternativasId;
            } else {
              console.warn(
                `Formato inesperado para resposta da questão ${questaoId}:`,
                answerData
              );
              return null;
            }
          } else {
            console.warn(
              `Estrutura de resposta inválida para questão ${questaoId}:`,
              answerData
            );
            return null;
          }
          return payload as SubmitRespostaRequestPayload;
        })
        .filter(
          (resposta): resposta is SubmitRespostaRequestPayload =>
            resposta !== null
        );

      const payload: SubmitAvaliacaoRequestPayload = {
        respostas: respostasPayload,
      };

      await $api(
        `/backoffice/submissao/${submissionDetails.value.hash}/enviar`,
        {
          method: "PATCH",
          body: payload,
        }
      );

      if (submissionDetails.value) {
        submissionDetails.value.estado = EstadoSubmissaoEnum.ENVIADA;
        submissionDetails.value.finalizadoEm = new Date().toISOString();
      }

      toast.add({
        title: "Avaliação enviada!",
        description: "Suas respostas foram registradas com sucesso.",
        color: "secondary",
        icon: "i-lucide-check-circle",
      });
      return true;
    } catch (error: unknown) {
      console.error("Erro ao enviar respostas:", error);
      let errorMessage =
        "Ocorreu um erro desconhecido ao enviar suas respostas.";
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
          ).message ?? "Ocorreu um erro desconhecido ao enviar suas respostas.";
      }
      toast.add({
        title: "Erro ao Enviar",
        description: errorMessage,
        color: "error",
        icon: "i-lucide-alert-triangle",
      });
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function fetchSubmissionReviewData(hash: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    reviewQuestions.value = null;
    quantidadeTentativas.value = null;

    try {
      const response = await $api<FindSubmissaoRevisaoResponse>(
        `/backoffice/submissao/${hash}/revisao`
      );

      if (response) {
        submissionDetails.value = response.submissao;
        submissionFiles.value = response.arquivos;
        dataInicioAplicacao.value = response.dataInicioAplicacao;
        tempoMaximoAvaliacao.value = response.tempoMaximoAvaliacao;
        descricaoAvaliacao.value = response.descricaoAvaliacao;
        mostrarPontuacao.value = response.mostrarPontuacao;
        permitirRevisao.value = response.permitirRevisao;
        tituloAvaliacao.value = response.tituloAvaliacao;
        nomeAvaliador.value = response.nomeAvaliador;
        quantidadeTentativas.value = response.quantidadeTentativas;
        reviewQuestions.value = response.questoes;

        if (response.permitirRevisao === false) {
          throw new Error("A revisão não está permitida para esta avaliação.");
        }
        const estadosPermitidos = [EstadoSubmissaoEnum.AVALIADA];
        if (!estadosPermitidos.includes(response.submissao.estado)) {
          throw new Error(
            `A revisão não está disponível para o estado "${response.submissao.estado}".`
          );
        }

        return true;
      } else {
        throw new Error(
          "Resposta inválida do servidor ao buscar dados da revisão."
        );
      }
    } catch (error: unknown) {
      console.error("Erro ao buscar dados da revisão:", error);
      let errorMessage =
        "Ocorreu um erro desconhecido ao buscar dados da revisão.";
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
        title: "Erro ao buscar dados da revisão",
        description: errorMessage,
        color: "error",
        icon: "i-lucide-alert-triangle",
      });

      isLoading.value = true;
      reviewQuestions.value = null;
      quantidadeTentativas.value = null;

      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  function aplicarPenalidadePontos(pontos: number) {
    if (pontos > 0) {
      pontosPerdidos.value += pontos;
    }
  }

  return {
    submissionDetails,
    submissionQuestions,
    submissionFiles,
    isLoading,
    isSubmitting,
    error,
    dataInicioAplicacao,
    tempoMaximoAvaliacao,
    descricaoAvaliacao,
    mostrarPontuacao,
    permitirRevisao,
    tituloAvaliacao,
    nomeAvaliador,
    reviewQuestions,
    quantidadeTentativas,
    proibirTrocarAbas,
    proibirPrintScreen,
    proibirCopiarColar,
    proibirDevtools,
    pontosPerdidos,
    aplicarPenalidadePontos,
    createStudentSubmission,
    fetchSubmissionDataByHash,
    submitStudentAnswers,
    fetchSubmissionReviewData,
  };
});
