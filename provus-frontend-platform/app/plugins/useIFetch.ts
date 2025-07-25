import type { UseFetchOptions } from "#app";
import { defu } from "defu";

export async function useIFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const accessToken = useCookie("accessToken");

  const defaults: UseFetchOptions<T> = {
    baseURL: process.env.PROVUS_API_URL || "http://localhost:8000",
    key: url,
    headers: accessToken.value
      ? { Authorization: `Bearer ${accessToken.value}` }
      : {},
    onResponse: async ({ response, options }) => {
      if (response.status === 401) {
        try {
          const newToken = await refreshToken();
          accessToken.value = newToken;

          if (
            options.headers &&
            typeof options.headers === "object" &&
            !("append" in options.headers)
          ) {
            (options.headers as Record<string, string>)[
              "Authorization"
            ] = `Bearer ${newToken}`;
          }
          useFetch(url, options as UseFetchOptions<T>);
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }
    },
  };

  const params = defu(options, defaults);

  return useFetch(url, params);
}

async function refreshToken() {
  const refreshToken = useCookie("refreshToken");

  const { data, status } = await useFetch<{ access: string }>(
    `${
      process.env.PROVUS_API_URL || "http://localhost:8000"
    }/api/token/refresh/`,
    {
      method: "POST",
      body: { refresh: refreshToken.value },
    }
  );

  if (status.value === "success") {
    return data.value?.access;
  } else {
    throw new Error("Token refresh failed");
  }
}
