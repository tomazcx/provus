import { io, type Socket } from "socket.io-client";

export function useWebSocket() {
  const config = useRuntimeConfig();
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const socketId = ref<string | null>(null);
  const error = ref<Error | null>(null);

  const baseURL = config.public.provusApiUrl || "http://172.18.0.3:8000";

  const connect = (
    namespace: string,
    authPayload?: Record<string, unknown>
  ) => {
    disconnect();

    try {
      error.value = null;
      const socketInstance = io(baseURL + namespace, {
        auth: authPayload || {},
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        isConnected.value = true;
        socketId.value = socketInstance.id ?? null;
        error.value = null;
        console.log(
          `WebSocket connected to ${namespace}: ${socketInstance.id}`
        );
      });

      socketInstance.on("disconnect", (reason) => {
        isConnected.value = false;
        socketId.value = null;
        console.log(`WebSocket disconnected from ${namespace}: ${reason}`);
      });

      socketInstance.on("connect_error", (err) => {
        isConnected.value = false;
        socketId.value = null;
        error.value = err;
        console.error(
          `WebSocket connection error to ${namespace}:`,
          err.message
        );
      });

      socket.value = socketInstance;
    } catch (e) {
      console.error(
        `Failed to initialize WebSocket connection to ${namespace}:`,
        e
      );
      error.value =
        e instanceof Error ? e : new Error("Unknown connection error");
    }
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
      socketId.value = null;
      console.log("WebSocket manually disconnected.");
    }
  };

  const on = <T>(event: string, callback: (data: T) => void) => {
    if (socket.value) {
      socket.value.on(event, callback);
    } else {
      console.warn(
        "WebSocket is not connected. Cannot listen to event:",
        event
      );
    }
  };

  const emit = <T>(event: string, data: T) => {
    if (socket.value && isConnected.value) {
      socket.value.emit(event, data);
    } else {
      console.warn("WebSocket is not connected. Cannot emit event:", event);
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    socketId,
    error,
    connect,
    disconnect,
    on,
    emit,
  };
}
