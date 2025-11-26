import { create } from "zustand";
import api from "../services/api";
import { AplicacaoEntity } from "../types/entities/Aplicacao.entity";
import { EstadoAplicacaoEnum } from "../enums/EstadoAplicacaoEnum";
import { mapAplicacaoApiResponseToEntity } from "@/utils/mappers";

interface ApplicationsState {
  applications: AplicacaoEntity[];
  isLoading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  fetchApplicationDetails: (id: number) => Promise<void>;
  deleteApplication: (applicationId: number) => Promise<boolean>;
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
  error: null,
  fetchApplications: async () => {
    set({ isLoading: true, error: null });
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

      set({ applications: mappedApplications, error: null });
    } catch (error) {
      console.error("Erro ao buscar aplicações:", error);
      const msg = "Erro ao carregar aplicações.";
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchApplicationDetails: async (id: number) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/backoffice/aplicacao/${id}`);
      const fullApplication = mapAplicacaoApiResponseToEntity(response.data);

      set((state) => {
        const exists = state.applications.find((a) => a.id === id);
        if (exists) {
          return {
            applications: state.applications.map((a) =>
              a.id === id ? fullApplication : a
            ),
          };
        } else {
          return {
            applications: [...state.applications, fullApplication],
          };
        }
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes da aplicação:", error);
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
  deleteApplication: async (applicationId: number) => {
    set({ isLoading: true });
    try {
      await api.delete(`/backoffice/aplicacao/${applicationId}`);

      set((state) => ({
        applications: state.applications.filter(
          (app) => app.id !== applicationId
        ),
      }));

      return true;
    } catch (error) {
      console.error("Erro ao deletar aplicação:", error);
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
