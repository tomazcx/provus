import { create } from "zustand";
import api from "../services/api";
import { AplicacaoEntity } from "../types/entities/Aplicacao.entity";
import { EstadoAplicacaoEnum } from "../enums/EstadoAplicacaoEnum";

interface ApplicationsState {
  applications: AplicacaoEntity[];
  isLoading: boolean;
  fetchApplications: () => Promise<void>;
  reopenApplication: (applicationId: number) => Promise<boolean>;
  getApplicationById: (id: number) => AplicacaoEntity | undefined;
  updateApplicationData: (
    applicationId: number,
    updatedFields: Partial<Pick<AplicacaoEntity, "estado" | "dataFim">>
  ) => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  isLoading: false,

  fetchApplications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/backoffice/aplicacoes");

      if (!Array.isArray(response.data)) {
        set({ applications: [] });
        return;
      }

      const mappedApplications: AplicacaoEntity[] = response.data.map(
        (item: any) => ({
          id: item.id,
          codigoAcesso: item.codigoAcesso,
          estado: item.estado as EstadoAplicacaoEnum,
          dataInicio: new Date(item.dataInicio),
          dataFim: new Date(item.dataFim),
          totalSubmissoes: item.totalSubmissoes,
          mediaGeralPercentual: item.mediaGeralPercentual,
          avaliacao: {
            id: item.avaliacao.id,
            titulo: item.avaliacao.titulo,
            descricao: item.avaliacao.descricao,
            pontuacao: item.avaliacao.pontuacao || 0,
          },
        })
      );

      mappedApplications.sort(
        (a, b) => b.dataInicio.getTime() - a.dataInicio.getTime()
      );

      set({ applications: mappedApplications });
    } catch (error) {
      console.error("Erro ao buscar aplicações:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getApplicationById: (id: number) => {
    return get().applications.find((app) => app.id === id);
  },
  reopenApplication: async (applicationId: number) => {
    set({ isLoading: true });
    try {
      const payload = { estado: EstadoAplicacaoEnum.CRIADA };

      await api.put(`/backoffice/aplicacao/${applicationId}`, payload);

      get().updateApplicationData(applicationId, {
        estado: EstadoAplicacaoEnum.CRIADA,
      });

      return true;
    } catch (error) {
      console.error("Erro ao reabrir aplicação:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  updateApplicationData: (applicationId, updatedFields) => {
    set((state) => ({
      applications: state.applications.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            ...updatedFields,
            dataFim: updatedFields.dataFim
              ? new Date(updatedFields.dataFim)
              : app.dataFim,
          };
        }
        return app;
      }),
    }));
  },
}));
