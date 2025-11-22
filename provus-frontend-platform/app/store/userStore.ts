import type { AvaliadorEntity } from "~/types/entities/Avaliador.entity";
import type {
  RecoverPasswordRequest,
  UpdateAvaliadorRequest,
} from "~/types/api/request/Avaliador.request";

export const useUserStore = defineStore("user", () => {
  const { $api } = useNuxtApp();
  const router = useRouter();
  const toast = useToast();

  const user = ref<AvaliadorEntity | null>(null);
  const isLoading = ref(false);

  const isLoggedIn = computed(() => !!user.value);

  async function fetchCurrentUser() {
    isLoading.value = true;
    try {
      const response = await $api<AvaliadorEntity>("/backoffice/avaliador/me");
      user.value = response;
    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      user.value = null;
      logout();
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(data: UpdateAvaliadorRequest) {
    isLoading.value = true;
    try {
      const response = await $api<AvaliadorEntity>("/backoffice/avaliador/me", {
        method: "PUT",
        body: data,
      });
      user.value = response;
      return true;
    } catch {
      const msg = "Erro ao atualizar perfil";
      toast.add({
        title: "Erro",
        description: msg,
        color: "error",
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function requestPasswordReset(email: string) {
    isLoading.value = true;
    try {
      const payload: RecoverPasswordRequest = { email };
      await $api("/auth/recuperar-senha", {
        method: "POST",
        body: payload,
      });
      return true;
    } catch {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    const tokenCookie = useCookie("accessToken");
    const refreshTokenCookie = useCookie("refreshToken");

    tokenCookie.value = null;
    refreshTokenCookie.value = null;
    user.value = null;

    router.push("/auth");
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    fetchCurrentUser,
    updateProfile,
    requestPasswordReset,
    logout,
  };
});
