import { create } from "zustand";
import api from "../services/api";
import { clearTokens } from "../utils/token";

export interface AvaliadorEntity {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface UpdateProfilePayload {
  nome: string;
  senha: string; 
  novaSenha?: string; 
}

interface UserState {
  user: AvaliadorEntity | null;
  isLoading: boolean;

  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AvaliadorEntity | null) => void;

  updateProfile: (data: UpdateProfilePayload) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<AvaliadorEntity>(
        "/backoffice/avaliador/me"
      );
      set({ user: response.data });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    set({ isLoading: true });
    try {
      const response = await api.put<AvaliadorEntity>(
        "/backoffice/avaliador/me",
        data
      );

      set({ user: response.data });
      return true;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  requestPasswordReset: async (email: string) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/recuperar-senha", { email });
      return true;
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await clearTokens();
    set({ user: null });
  },
}));
