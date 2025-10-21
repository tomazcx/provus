
import { useWebSocket } from "~/composables/useWebSocket";

export default defineNuxtPlugin(async (nuxtApp) => {
  const websocket = useWebSocket();
  const accessTokenCookie = useCookie<string | null>("accessToken");
  const token = accessTokenCookie.value;

  if (token) {
    console.log(
      "Plugin WebSocket: Token encontrado, tentando conectar ao /avaliador..."
    );
    const authPayload = { token: `Bearer ${token}` };
    websocket.connect("/avaliador", authPayload);
    websocket.socket.value?.on("connect", () => {
      console.log("Plugin WebSocket: Evento 'connect' recebido.");
    });
  } else {
    console.log(
      "Plugin WebSocket: Nenhum token encontrado, conexão não iniciada."
    );
  }

  nuxtApp.provide("websocket", websocket);

  watch(accessTokenCookie, (newToken) => {
    if (newToken && !websocket.isConnected.value) {
      console.log("Plugin WebSocket (watch): Token detectado, conectando...");
      const authPayload = { token: `Bearer ${newToken}` };
      websocket.connect("/avaliador", authPayload);
      websocket.socket.value?.on("connect", () => {
        console.log("Plugin WebSocket (watch): Evento 'connect' recebido.");
      });
    } else if (!newToken && websocket.isConnected.value) {
      console.log("Plugin WebSocket (watch): Token removido, desconectando...");
      websocket.disconnect();
    }
  });

  if (import.meta.client) {
    window.addEventListener("beforeunload", () => {
      console.log(
        "Plugin WebSocket: Evento 'beforeunload' detectado, desconectando."
      );
      websocket.disconnect();
    });
  }
});
