import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";

export const useWebSocket = (imageId: string, onMessage: (message: any) => void) => {
  const { user, token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const queryClient = useQueryClient();
  const API_BASE_URL = import.meta.env.VITE_API_URL_NOTIFICATION || '127.0.0.1:8000';

  const connect = useCallback(() => {
    if (!isMountedRef.current || !user?.id || !token || !imageId) return;

    // Cerrar conexión existente si hay una
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket(`ws://${API_BASE_URL}/ws/images/${imageId}`);
    console.log(socket)
    socketRef.current = socket;

    let pingInterval: NodeJS.Timeout;
    let reconnectTimeout : NodeJS.Timeout;
    const pingFrequency = 20000; // 20 segundos
    const maxReconnectAttempts = 5;

    const cleanup = () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
    };

    socket.onopen = () => {
      console.log(`🔵 WebSocket conectado para imagen ${imageId}`);
      reconnectAttemptsRef.current = 0;

      // Autenticación inicial
      socket.send(JSON.stringify({
        type: "auth",
        token: token,
        userId: user.id
      }));

      // Configurar ping cada 20 segundos
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, pingFrequency);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Ignorar mensajes de autenticación y ping/pong
        if (message.status === "authenticated" || message.type === "pong") {
          return;
        }

        // Manejar mensajes específicos
        if (message.event === "image_updated") {
          queryClient.setQueryData(['imageDetails', imageId], (old: any) => ({
            ...old,
            likes_count: message.data.likes_count,
            liked_by: message.data.liked_by
          }));
        } else if (message.event === "new_image_comment") {
          queryClient.setQueryData(['imageComments', imageId], (old: any[] = []) => [
            message.data,
            ...old
          ]);
          queryClient.invalidateQueries({ queryKey: ['imageDetails', imageId] });
        }

        // Pasar el mensaje al callback
        onMessage(message);
      } catch (error) {
        console.error('Error al procesar mensaje WebSocket:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('🔴 Error en WebSocket:', error);
      // Agrega más detalles del error
    };


    socket.onclose = (event) => {
      cleanup();

      if (!isMountedRef.current) return;

      console.log(`🟠 WebSocket desconectado para imagen ${imageId}`, event);

      // Solo reconectar para ciertos códigos de cierre
      const shouldReconnect = [1006, 1001].includes(event.code) &&
        reconnectAttemptsRef.current < maxReconnectAttempts;

      if (shouldReconnect) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        reconnectTimeout = setTimeout(connect, delay);
      }
    };
  }, [imageId, user?.id, token, onMessage, queryClient]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.close(1000, 'Componente desmontado');
        socketRef.current = null;
      }
    };
  }, [connect]);

  // Reconectar cuando cambia el token
  useEffect(() => {
    if (token) {
      connect();
    }
  }, [token, connect]);
};