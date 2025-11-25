import { create } from "zustand";
import api from "../services/api";
import { AvaliadorSubmissaoDetalheApiResponse } from "../types/api/response/AvaliadorSubmissaoDetalhe.response";
import { EstadoQuestaoCorrigida } from "../types/api/response/AvaliadorQuestaoDetalhe.response";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";

interface CorrectionState {
  submissionDetails: AvaliadorSubmissaoDetalheApiResponse | null;
  isLoading: boolean;
  isSaving: boolean;

  fetchSubmissionDetails: (
    applicationId: number,
    submissionId: number
  ) => Promise<void>;

  saveCorrection: (
    applicationId: number,
    submissionId: number,
    questionId: number,
    payload: { pontuacao: number; textoRevisao: string; maxPoints: number }
  ) => Promise<boolean>;

  finalizeSubmission: (
    applicationId: number,
    submissionId: number
  ) => Promise<boolean>;

  reset: () => void;
}

export const useCorrectionStore = create<CorrectionState>((set, get) => ({
  submissionDetails: null,
  isLoading: false,
  isSaving: false,

  fetchSubmissionDetails: async (applicationId, submissionId) => {
    set({ isLoading: true });
    try {
      const response = await api.get<AvaliadorSubmissaoDetalheApiResponse>(
        `/backoffice/aplicacao/${applicationId}/submissao/${submissionId}`
      );
      set({ submissionDetails: response.data });
    } catch (error) {
      console.error("Erro ao buscar detalhes da submissão:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveCorrection: async (
    appId,
    subId,
    qId,
    { pontuacao, textoRevisao, maxPoints }
  ) => {
    set({ isSaving: true });
    try {
      let novoEstado: EstadoQuestaoCorrigida;
      let notaFinal = pontuacao;

      if (pontuacao >= maxPoints) {
        novoEstado = EstadoQuestaoCorrigida.CORRETA;
        notaFinal = maxPoints;
      } else if (pontuacao > 0) {
        novoEstado = EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA;
      } else {
        novoEstado = EstadoQuestaoCorrigida.INCORRETA;
        notaFinal = 0;
      }

      const payload = {
        pontuacao: notaFinal,
        textoRevisao,
        estadoCorrecao: novoEstado,
      };

      await api.patch(
        `/backoffice/aplicacao/${appId}/submissao/${subId}/questao/${qId}`,
        payload
      );

      const details = get().submissionDetails;
      if (details) {
        const questionIndex = details.questoes.findIndex((q) => q.id === qId);
        if (questionIndex !== -1) {
          const updatedQuestions = [...details.questoes];
          updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            pontuacaoObtida: notaFinal,
            textoRevisao: textoRevisao,
            estadoCorrecao: novoEstado,
          };

          const newTotal = updatedQuestions.reduce(
            (acc, q) => acc + (Number(q.pontuacaoObtida) || 0),
            0
          );

          set({
            submissionDetails: {
              ...details,
              questoes: updatedQuestions,
              submissao: { ...details.submissao, pontuacaoTotal: newTotal },
            },
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao salvar correção:", error);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  finalizeSubmission: async (appId, subId) => {
    try {
      await api.patch(
        `/backoffice/aplicacao/${appId}/submissao/${subId}/estado`,
        { estado: EstadoSubmissaoEnum.AVALIADA }
      );

      const details = get().submissionDetails;
      if (details) {
        set({
          submissionDetails: {
            ...details,
            submissao: {
              ...details.submissao,
              estado: EstadoSubmissaoEnum.AVALIADA,
            },
          },
        });
      }
      return true;
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      return false;
    }
  },

  reset: () => set({ submissionDetails: null }),
}));
