import { create } from "zustand";
import api from "../services/api";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";
import {
  FindSubmissoesResponse,
  SubmissaoNaListaResponse,
} from "../types/api/response/FindSubmissoes.response";

interface SubmissionsState {
  data: FindSubmissoesResponse | null;
  submissions: SubmissaoNaListaResponse[];
  isLoading: boolean;

  fetchSubmissions: (applicationId: number) => Promise<void>;
  updateSubmissionStatus: (
    submissionId: number,
    status: EstadoSubmissaoEnum
  ) => void;
}

export const useSubmissionsStore = create<SubmissionsState>((set, get) => ({
  data: null,
  submissions: [],
  isLoading: false,

  fetchSubmissions: async (applicationId: number) => {
    set({ isLoading: true });
    try {
      const response = await api.get<FindSubmissoesResponse>(
        `/backoffice/aplicacao/${applicationId}/submissoes`
      );

      set({
        data: response.data,
        submissions: response.data.submissoes || [],
      });
    } catch (error) {
      console.error("Erro ao buscar submissões:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSubmissionStatus: (submissionId, status) => {
    const { submissions } = get();
    const updated = submissions.map((sub) =>
      sub.id === submissionId ? { ...sub, estado: status } : sub
    );
    set({ submissions: updated });
  },
}));
