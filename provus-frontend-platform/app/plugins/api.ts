import { ofetch } from "ofetch";

let refreshTokenPromise: Promise<void> | null = null;
const publicRoutes = ["/auth/sign-in", "/auth/sign-up", "/token/refresh/"];

async function performTokenRefresh() {
  const refreshTokenCookie = useCookie("refreshToken");
  if (!refreshTokenCookie.value) {
    throw new Error("No refresh token available.");
  }

  try {
    const { access } = await ofetch<{ access: string }>("/token/refresh/", {
      baseURL: process.env.PROVUS_API_URL || "http://localhost:8080/api",
      method: "POST",
      body: { refresh: refreshTokenCookie.value },
    });

    const accessToken = useCookie("accessToken");
    accessToken.value = access;
  } catch (error) {
    const accessToken = useCookie("accessToken");
    const refreshTokenCookie = useCookie("refreshToken");
    accessToken.value = null;
    refreshTokenCookie.value = null;

    console.error("Token refresh failed, logging out.", error);

    throw error;
  }
}

export default defineNuxtPlugin(() => {
  const api: typeof $fetch = $fetch.create({
    baseURL: process.env.PROVUS_API_URL || "http://localhost:8080/api",

    onRequest({ request, options }) {
      if (publicRoutes.includes(request.toString())) {
        return;
      }

      const accessToken = useCookie("accessToken").value;
      if (accessToken) {
        if (!options.headers) {
          options.headers = new Headers();
        }
        (options.headers as Headers).set(
          "Authorization",
          `Bearer ${accessToken}`
        );
      }
    },

    async onResponseError({ request, options, response }) {
      if (
        response.status !== 401 ||
        publicRoutes.includes(request.toString())
      ) {
        return;
      }

      if (!refreshTokenPromise) {
        refreshTokenPromise = performTokenRefresh().finally(() => {
          refreshTokenPromise = null;
        });
      }

      try {
        await refreshTokenPromise;

        return api(request, {
          ...options,
          method: options.method?.toLowerCase() as
            | "get"
            | "head"
            | "patch"
            | "post"
            | "put"
            | "delete"
            | "connect"
            | "options"
            | "trace"
            | undefined,
        });
      } catch (error) {
        return Promise.reject(response);
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
