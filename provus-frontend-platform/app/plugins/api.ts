import { ofetch } from "ofetch";
import { setServerTimeOffset } from "~/utils/serverTime";
import { useGlobalLoadingStore } from "~/store/globalLoadingStore";

let refreshTokenPromise: Promise<void> | null = null;

const publicRoutes = ["/auth/sign-in", "/auth/sign-up", "/token/refresh/"];

const loadingExcludedRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/recuperar-senha",
  "/token/refresh/",
  "/backoffice/encontrar-avaliacao", 
];

async function performTokenRefresh() {
  const refreshTokenCookie = useCookie("refreshToken");
  if (!refreshTokenCookie.value) {
    throw new Error("No refresh token available.");
  }

  const config = useRuntimeConfig();
  const baseURL = config.public.provusApiUrl || "http://localhost:8000/api";

  try {
    const { access } = await ofetch<{ access: string }>("/token/refresh/", {
      baseURL: baseURL,
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
  const config = useRuntimeConfig();
  const globalLoadingStore = useGlobalLoadingStore();

  const api: typeof $fetch = $fetch.create({
    baseURL: config.public.provusApiUrl || "http://localhost:8000/api",

    onRequest({ request, options }) {
      const reqUrl = request.toString();

      const shouldSkipLoading = loadingExcludedRoutes.some((route) =>
        reqUrl.includes(route)
      );

      if (!shouldSkipLoading) {
        globalLoadingStore.startLoading();
      }

      if (publicRoutes.includes(reqUrl)) {
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

    async onResponse({ response, request }) {
      const reqUrl = request.toString();
      const wasLoadingIncluded = !loadingExcludedRoutes.some((route) =>
        reqUrl.includes(route)
      );

      if (wasLoadingIncluded) {
        globalLoadingStore.finishLoading();
      }

      const dateHeader = response.headers.get("date");
      if (dateHeader) {
        setServerTimeOffset(dateHeader);
      }
    },

    async onResponseError({ request, options, response }) {
      const reqUrl = request.toString();
      const wasLoadingIncluded = !loadingExcludedRoutes.some((route) =>
        reqUrl.includes(route)
      );

      if (wasLoadingIncluded) {
        globalLoadingStore.finishLoading();
      }

      const dateHeader = response.headers.get("date");
      if (dateHeader) {
        setServerTimeOffset(dateHeader);
      }

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
      } catch {
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
