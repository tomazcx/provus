import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../services/api";

export function useWebSocket() {
  const socket = useRef<Socket | null>(null);

  const activeNamespaceRef = useRef<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const baseURL = API_URL.replace("/api", "");

  const connect = useCallback(
    (namespace: string, authPayload?: Record<string, unknown>) => {
      if (
        socket.current?.connected &&
        activeNamespaceRef.current === namespace
      ) {
        console.log("WebSocket already connected to", namespace);
        return;
      }

      if (socket.current) {
        socket.current.disconnect();
        socket.current.removeAllListeners();
      }

      try {
        setError(null);
        activeNamespaceRef.current = namespace;

        console.log(`Connecting to WebSocket: ${baseURL}${namespace}`);

        const socketInstance = io(baseURL + namespace, {
          auth: authPayload || {},
          transports: ["websocket"],
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketInstance.on("connect", () => {
          setIsConnected(true);
          setSocketId(socketInstance.id || null);
          setError(null);
          console.log(
            `WebSocket connected to ${namespace}: ${socketInstance.id}`
          );
        });

        socketInstance.on("disconnect", (reason) => {
          if (reason !== "io client disconnect") {
            setIsConnected(false);
            setSocketId(null);
            console.log(`WebSocket disconnected from ${namespace}: ${reason}`);
          }
        });

        socketInstance.on("connect_error", (err) => {
          console.error(
            `WebSocket connection error to ${namespace}:`,
            err.message
          );
        });

        socket.current = socketInstance;
      } catch (e: any) {
        console.error(
          `Failed to initialize WebSocket connection to ${namespace}:`,
          e
        );
        setError(
          e instanceof Error ? e : new Error("Unknown connection error")
        );
        activeNamespaceRef.current = null;
      }
    },
    [baseURL]
  );

  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current.removeAllListeners();
      socket.current = null;

      activeNamespaceRef.current = null;
      setIsConnected(false);
      setSocketId(null);

      console.log("WebSocket manually disconnected.");
    }
  }, []);

  const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
    if (socket.current) {
      socket.current.off(event);
      socket.current.on(event, callback);
    }
  }, []);

  const emit = useCallback(<T>(event: string, data: T) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

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
