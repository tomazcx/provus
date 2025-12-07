import axios from "axios";
import {
  getToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/token";
import { setServerTimeOffset } from "@/utils/serverTime";
// import Constants from "expo-constants";

// const debuggerHost = Constants.expoConfig?.hostUri;
// const localhost = debuggerHost?.split(":")[0];
// const EXPO_IP = localhost
//   ? `http://${localhost}:8000/api`
//   : "http://192.168.100.15:8000/api";

export const API_URL = "https://provus.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicRoutes = ["/auth/sign-in", "/auth/sign-up", "/token/refresh/"];

const getFriendlyErrorMessage = (error: any) => {
  if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
    return "Verifique sua conexão com a internet e tente novamente.";
  }
  if (error.response) {
    return error.response.data?.message || "Ocorreu um erro no servidor.";
  }
  return "Ocorreu um erro inesperado.";
};

api.interceptors.request.use(
  async (config) => {
    if (publicRoutes.some((route) => config.url?.includes(route))) {
      return config;
    }

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.headers && response.headers["date"]) {
      setServerTimeOffset(response.headers["date"]);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    error.friendlyMessage = getFriendlyErrorMessage(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !publicRoutes.includes(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;
        await setTokens(newAccessToken);

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
