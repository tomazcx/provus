import { useUserStore } from "~/store/userStore";

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const token = useCookie("accessToken");

  if (to.path.startsWith("/aluno")) {
    return;
  }

  if (to.path.startsWith("/auth") || to.path.startsWith("/confirmar-email")) {
    if (token.value && userStore.isLoggedIn) {
      return navigateTo("/home");
    }
    return;
  }

  if (!token.value) {
    return navigateTo("/auth");
  }

  if (!userStore.isLoggedIn) {
    try {
      await userStore.fetchCurrentUser();
    } catch {
      return navigateTo("/auth");
    }
  }
});
