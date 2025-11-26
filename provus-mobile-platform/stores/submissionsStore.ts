import { create } from "zustand";
import api from "../services/api";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";
import {
  FindSubmissoesResponse,
  SubmissaoNaListaResponse,
} from "../types/api/response/FindSubmissoes.response";
import Toast from "react-native-toast-message";

interface SubmissionsState {
  data: FindSubmissoesResponse | null;
  submissions: SubmissaoNaListaResponse[];
  isLoading: boolean;
  fetchSubmissions: (applicationId: number) => Promise<void>;
  updateSubmissionStatus: (
    submissionId: number,
    status: EstadoSubmissaoEnum
  ) => void;
  confirmarCodigo: (
    applicationId: number,
    submissionId: number,
    codigoEntrega: number
  ) => Promise<boolean>;
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

  confirmarCodigo: async (applicationId, submissionId, codigoEntrega) => {
    try {
      await api.patch(
        `/backoffice/aplicacao/${applicationId}/submissao/${submissionId}/confirmar-codigo`,
        { codigoEntrega }
      );

      get().updateSubmissionStatus(
        submissionId,
        EstadoSubmissaoEnum.CODIGO_CONFIRMADO
      );

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Código confirmado!",
      });

      return true;
    } catch (error: any) {

      let message = "Não foi possível confirmar.";
      if (error.response?.status === 400 || error.response?.status === 422) {
        message = "Código incorreto.";
      }

      Toast.show({
        type: "error",
        text1: "Erro",
        text2: message,
      });
      return false;
    }
  },
}));
