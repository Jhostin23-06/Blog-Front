import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../src/modules/blog/application/useAuth";
import type { Notification } from "../modules/blog/domain/Notification";
import { useQueryClient } from "@tanstack/react-query";
import type { Post } from "../modules/blog/domain/Post";
//import type { User } from "../modules/blog/domain/User";

type WebSocketMessage = {
  event: string;
  data: any;
};

type ImageUpdateMessage = {
  event: "image_updated" | "new_image_comment";
  data: {
    image_id: string;
    likes_count?: number;
    liked_by?: string[];
    timestamp?: string;
    // Para comentarios:
    _id?: string;
    content?: string;
    author_id?: string;
    author_username?: string;
    created_at?: string;
  };
};

const API_BASE_URL = import.meta.env.VITE_API_URL_NOTIFICATION || '127.0.0.1:8000';

type AuthContextType = ReturnType<typeof useAuth> & {
  subscribeToPostUpdates: (postId: string) => void;
  unsubscribeFromPostUpdates: (postId: string) => void;
  notifications: Notification[];
  wsNotifications: Notification[]; // Notificaciones de WebSocket
  unreadCount: number;
  markAsRead: (notificationIds: string[]) => void;
  markAllAsRead: () => void;
  isNotificationsLoading: boolean;
  subscribeToImageUpdates: (imageId: string) => void,
  unsubscribeFromImageUpdates: (imageId: string) => void,
  //updateUser: (user: any) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const socketsRef = useRef<Record<string, WebSocket>>({});
  const notificationSocketRef = useRef<WebSocket | null>(null);
  const [apiNotifications, setApiNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [wsNotifications, setWsNotifications] = useState<Notification[]>([]);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Añade estas funciones al contexto
  const imageSocketsRef = useRef<Record<string, WebSocket>>({});

  const playNotificationSound = useCallback(() => {
    if (!notificationSoundRef.current) return;

    // Verifica si el audio está listo
    if (notificationSoundRef.current.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      notificationSoundRef.current.currentTime = 0; // Reinicia si ya se estaba reproduciendo
      notificationSoundRef.current.play().catch(e => {
        console.error("Error al reproducir sonido:", e);
        // Intenta cargar de nuevo si hay error
        notificationSoundRef.current?.load();
      });
    } else {
      console.warn("El audio no está listo para reproducirse");
      // Intenta cargar de nuevo
      notificationSoundRef.current.load();
    }
  }, []);


  // Notificaciones combinadas (API + WebSocket)
  const notifications = useMemo(() => {
    const allNotifications = [...wsNotifications, ...apiNotifications];
    const uniqueIds = new Set();

    return allNotifications.filter(notification => {
      if (!uniqueIds.has(notification._id)) {
        uniqueIds.add(notification._id);
        return true;
      }
      return false;
    });
  }, [apiNotifications, wsNotifications]);

  // Función para conectar al WebSocket de notificaciones

  // Función para conectar al WebSocket de notificaciones
  const connectNotificationSocket = useCallback((userId: string, token: string) => {
    // Si ya hay una conexión y está abierta o conectando, no hacer nada
    if (notificationSocketRef.current &&
      [WebSocket.OPEN, WebSocket.CONNECTING].includes(notificationSocketRef.current.readyState as never)) {
      return;
    }

    // Cerrar conexión existente si hay una
    if (notificationSocketRef.current) {
      notificationSocketRef.current.close();
      notificationSocketRef.current = null;
    }

    const socket = new WebSocket(`wss://${API_BASE_URL}/ws/notifications/${userId}`);

    let authenticated = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let pingInterval: ReturnType<typeof setInterval>;

    const cleanup = () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
    };

    const authenticate = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "auth",
          token: token,
          userId: userId
        }));
      }
    };

    const setupPing = () => {
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN && authenticated) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 20000);
    };

    socket.onopen = () => {
      console.log('Conexión establecida, enviando autenticación');
      authenticate();
      setupPing();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Mensaje recibido:', message);

        if (message.status === "authenticated") {
          authenticated = true;
          reconnectAttempts = 0;
          return;
        }

        // Manejar posts eliminados
        if (message.event === "post_deleted") {
          queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) =>
            oldPosts.filter(post => post._id !== message.data.post_id)
          );
        }

        // Manejar nuevos posts
        if (message.event === "new_post") {
          queryClient.setQueryData<Post[]>(['posts'], (oldPosts) => {
            const currentPosts = Array.isArray(oldPosts) ? oldPosts : [];

            if (!message.data?._id) {
              console.error('Post sin ID recibido:', message.data);
              return currentPosts;
            }
            // Evitar duplicados
            if (currentPosts.some(post => post._id === message.data._id)) {
              return currentPosts;
            }
            return [message.data, ...currentPosts];
          });
          // Actualiza la caché de posts por usuario
          queryClient.setQueryData<Post[]>(['postsbyusers', message.data.author_id], (oldPosts) => {
            const currentPosts = Array.isArray(oldPosts) ? oldPosts : [];
            // Evitar duplicados
            if (currentPosts.some(post => post._id === message.data._id)) {
              return currentPosts;
            }
            return [message.data, ...currentPosts];
          });

          queryClient.setQueryData<Post[]>(['postbyid', message.data._id], (oldPosts) => {
            const currentPosts = Array.isArray(oldPosts) ? oldPosts : [];
            // Evitar duplicados
            if (currentPosts.some(post => post._id === message.data._id)) {
              return currentPosts;
            }
            return [message.data, ...currentPosts];
          });

          // Invalidar las consultas para forzar una recarga
          queryClient.invalidateQueries({ queryKey: ['postsbyusers', message.data.author_id] });
          // Invalidar las consultas para forzar una recarga
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          // Invalidar las consultas para forzar una recarga
          queryClient.invalidateQueries({ queryKey: ['postbyid', message.data._id] });

        }

        if (message.event === "profile_updated") {
          const updatedUser = message.data;
          const updatedUserId = updatedUser.id;

          // Actualiza la caché del usuario
          queryClient.setQueryData(['user', updatedUserId], (oldUser: any) => ({
            ...oldUser,
            ...updatedUser,
          }));

          // Actualiza la caché de posts generales
          queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) =>
            oldPosts.map(post =>
              post.author_id === updatedUserId
                ? {
                  ...post,
                  author_username: updatedUser.username ?? post.author_username,
                  author_profile_picture: updatedUser.profile_picture ?? post.author_profile_picture,

                }
                : post
            )
          );

          // Actualiza la caché de posts por usuario
          queryClient.setQueryData<Post[]>(['postsbyusers', updatedUserId], (oldPosts = []) =>
            oldPosts.map(post => ({
              ...post,
              author_username: updatedUser.username ?? post.author_username,
              author_profile_picture: updatedUser.profile_picture ?? post.author_profile_picture,

            }))
          );

          // Opcional: invalidar queries para forzar refetch si lo necesitas
          queryClient.invalidateQueries({ queryKey: ['postsbyusers', updatedUserId] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }

        if (message.event === "new_notification") {

          if (!message.data || !message.data.type) {
            console.error("Estructura de notificación inválida", message);
            return;
          }

          playNotificationSound();

          setWsNotifications(prev => {
            const currentNotifications = Array.isArray(prev) ? prev : [];

            if (!message.data?._id) {
              console.error('Notificación sin ID recibida:', message.data);
              return currentNotifications;
            }
            const exists = currentNotifications.some(n => n._id === message.data._id);
            if (exists) return currentNotifications;
            console.log("Agregando notificación WS:", message.data);

            setApiNotifications(prevApi => {
              const existsInApi = prevApi.some(n => n._id === message.data._id);
              return existsInApi ? prevApi : [...prevApi, message.data];
            });

            // Agregar lógica específica para solicitudes de amistad
            if (message.data.type === "friend_request") {
              // Actualizar estado de solicitudes
              queryClient.setQueryData(['user', userId], (oldUser: any) => ({
                ...oldUser,
                friend_requests: [...(oldUser.friend_requests || []), message.data.emitter_id],
                relationships: {
                  ...oldUser.relationships,
                  [message.data.emitter_id]: "request_received"
                }
              }));
            }
            else if (message.data.type === "friend_accepted") {
              // Actualizar estado de amigos
              queryClient.setQueryData(['user', userId], (oldUser: any) => ({
                ...oldUser,
                friends: [...(oldUser.friends || []), message.data.emitter_id],
                sent_requests: (oldUser.sent_requests || []).filter((id: string) => id !== message.data.emitter_id),
                relationships: {
                  ...oldUser.relationships,
                  [message.data.emitter_id]: "friend"
                }
              }));
            }

            return [message.data, ...prev];
          });

          queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
          queryClient.invalidateQueries({ queryKey: ['friends'] });
          queryClient.invalidateQueries({ queryKey: ['user', userId] });
          queryClient.invalidateQueries({ queryKey: ['comment'] });
          //queryClient.invalidateQueries({ queryKey: ['postbyid', message.data.post_id] });

        }
      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
      cleanup();
    };

    socket.onclose = (event) => {
      console.log(`Conexión cerrada (código ${event.code})`, event.reason);
      cleanup();

      // No reconectar si fue un cierre intencional (1000) o error de autenticación (1008)
      if (event.code === 1000 || event.code === 1008) {
        console.log('Conexión cerrada intencionalmente, no reconectar');
        return;
      }

      // Verificar si el token sigue siendo válido antes de reconectar
      if (reconnectAttempts < maxReconnectAttempts && auth.token) {
        reconnectAttempts++;
        const delay = Math.min(3000 * reconnectAttempts, 15000);
        console.log(`Reconectando en ${delay}ms (intento ${reconnectAttempts})`);

        reconnectTimeout = setTimeout(() => {
          connectNotificationSocket(userId, auth.token!);
        }, delay);
      } else {
        console.log('Máximo de intentos de reconexión alcanzado o token inválido');
      }
    };

    notificationSocketRef.current = socket;

    // Retornar función de limpieza
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Componente desmontado');
      }
      cleanup();
    };
  }, [queryClient, auth.token]); // Dependencia del token

  const subscribeToPostUpdates = useCallback((postId: string) => {
    // Si ya hay una conexión para este post, no crear otra
    if (socketsRef.current[postId]) return;

    // Crear nueva conexión WebSocket para el post específico
    const socket = new WebSocket(`wss://${API_BASE_URL}/ws/${postId}`);
    socketsRef.current[postId] = socket;

    socket.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      if (message.event === "post_updated") { 
        // Solo actualiza si el postId coincide
        if (message.data.post_id === postId) {
          queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) => {
            return oldPosts.map(post => {
              if (post._id === postId) {
                return {
                  ...post,
                  likes_count: message.data.likes_count,
                  liked_by: message.data.liked_by,
                };
              }
              return post;
            });
          });

          // Invalidar las consultas para forzar una recarga
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['postsbyusers'] });
          queryClient.invalidateQueries({ queryKey: ['postbyid', postId] });

        }
      }

      if (message.event === "post_deleted") {
        queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) =>
          oldPosts.filter(post => post._id !== message.data.post_id)
        );
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['postsbyusers'] });
        queryClient.invalidateQueries({ queryKey: ['post', postId] });

      }

      // evento de los usuarios actualizados

      if (message.event === "profile_updated") {
        const updatedUser = message.data;
        const updatedUserId = updatedUser.id;

        // Actualiza la caché del usuario
        queryClient.setQueryData(['user', updatedUserId], (oldUser: any) => ({
          ...oldUser,
          ...updatedUser,
        }));

        // Actualiza la caché de posts generales
        queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) =>
          oldPosts.map(post =>
            post.author_id === updatedUserId
              ? {
                ...post,
                author_username: updatedUser.username ?? post.author_username,
                author_profile_picture: updatedUser.profile_picture ?? post.author_profile_picture,
              }
              : post
          )
        );

        // Actualiza la caché de posts por usuario
        queryClient.setQueryData<Post[]>(['postsbyusers', updatedUserId], (oldPosts = []) =>
          oldPosts.map(post => ({
            ...post,
            author_username: updatedUser.username ?? post.author_username,
            author_profile_picture: updatedUser.profile_picture ?? post.author_profile_picture,
          }))
        );

        queryClient.invalidateQueries({ queryKey: ['postsbyusers', updatedUserId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['postbyid', postId] });
      }


      if (message.event === "new_comment" && message.data.post_id === postId) {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["postsbyusers"] });
        queryClient.invalidateQueries({ queryKey: ['postbyid', postId] });
      }
    };

    socket.onclose = () => {
      delete socketsRef.current[postId];
    };
  }, [queryClient]);

  const unsubscribeFromPostUpdates = useCallback((postId: string) => {
    if (socketsRef.current[postId]) {
      socketsRef.current[postId].close();
      delete socketsRef.current[postId];
    }
  }, []);

  const subscribeToImageUpdates = useCallback((imageId: string) => {
    console.log(`Subscribing to image updates for ${imageId}`);

    // If already connected, return
    if (imageSocketsRef.current[imageId]?.readyState === WebSocket.OPEN) {
      console.log(`Already connected to image ${imageId}`);
      return;
    }

    // Close existing connection if any
    if (imageSocketsRef.current[imageId]) {
      console.log(`Closing existing connection for image ${imageId}`);
      imageSocketsRef.current[imageId].close();
      delete imageSocketsRef.current[imageId];
    }

    // Create new connection
    const socket = new WebSocket(`wss://${API_BASE_URL}/ws/images/${imageId}`);
    imageSocketsRef.current[imageId] = socket;

    let authenticated = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
    };

    const authenticate = () => {
      if (socket.readyState === WebSocket.OPEN && auth.token && auth.user?.id) {
        console.log(`Authenticating for image ${imageId}`);
        socket.send(JSON.stringify({
          type: "auth",
          token: auth.token,
          userId: auth.user.id
        }));
      }
    };

    const setupPing = () => {
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN && authenticated) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 20000); // Ping every 20 seconds
    };

    socket.onopen = () => {
      console.log(`Connected to image ${imageId}`);
      authenticate();
      setupPing();
    };

    socket.onmessage = (event) => {
      try {
        
        // Handle ping/pong
        if (event.data === "pong") {
          console.debug("Pong received");
          return;
        }

        if (event.data === "ping") {
          socket.send("pong");
          return;
        }

        // Parse message
        const message = JSON.parse(event.data);

        // Handle authentication response
        // if (message.status === "authenticated") {
        //   authenticated = true;
        //   reconnectAttempts = 0;
        //   console.log("✅ WebSocket autenticado correctamente");
        //   return;
        // }

        // // Only process messages if authenticated
        // if (!authenticated) {
        //   console.warn("⚠️ Mensaje recibido antes de autenticación:", message);
        //   return;
        // }

        // Handle image updates
        if (message.event === "image_updated") {
          console.log("Image update received 524:", message.data);

          // Forzar una nueva obtención de datos desde la API
          queryClient.invalidateQueries<ImageUpdateMessage[]>({
            queryKey: ['imageDetails', message.data.image_id]
          });

        }

        // Handle new comments
        if (message.event === "new_image_comment") {
          
          console.log("New comment received:", message.data);

          // Forzar una nueva obtención de datos desde la API
          queryClient.invalidateQueries<ImageUpdateMessage[]>({
            queryKey: ['imageDetails', message.data.image_id]
          });

          // Forzar una nueva obtención de datos desde la API
          queryClient.invalidateQueries<ImageUpdateMessage[]>({
            queryKey: ['imageComments', message.data.image_id]
          });

        }

      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    socket.onclose = (event) => {
      console.log(`Connection closed for image ${imageId}`, event.code, event.reason);
      cleanup();
      delete imageSocketsRef.current[imageId];

      // Don't reconnect if closed normally
      if (event.code === 1000) return;

      // Reconnect logic
      if (reconnectAttempts < maxReconnectAttempts && auth.token) {
        reconnectAttempts++;
        const delay = Math.min(3000 * reconnectAttempts, 15000);
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);

        reconnectTimeout = setTimeout(() => {
          subscribeToImageUpdates(imageId);
        }, delay);
      }
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for image ${imageId}:`, error);
    };

    // Return cleanup function
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Component unmounted');
      }
      cleanup();
    };
  }, [auth.token, auth.user?.id, queryClient]);

  const unsubscribeFromImageUpdates = useCallback((imageId: string) => {
    if (imageSocketsRef.current[imageId]) {
      console.log(`Unsubscribing from image ${imageId}`);
      imageSocketsRef.current[imageId].close(1000, 'User initiated unsubscribe');
      delete imageSocketsRef.current[imageId];
    }
  }, []);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch(`https://${API_BASE_URL}/api/notifications/mark-as-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(notificationIds)
      });

      // Actualiza ambas fuentes de notificaciones
      setApiNotifications(prev =>
        prev.map(n => notificationIds.includes(n._id) ? { ...n, read: true } : n)
      );
      setWsNotifications(prev =>
        prev.map(n => notificationIds.includes(n._id) ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  // Cargar notificaciones iniciales y conectar WebSocket
  useEffect(() => {
    if (!auth.user?.id || !auth.token) return;

    const fetchNotifications = async () => {
      try {
        setIsNotificationsLoading(true);
        const response = await fetch(`https://${API_BASE_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
          }
        });
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('La respuesta de notificaciones no es un array:', data);
          setApiNotifications([]);
          return;
        }
        setApiNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setApiNotifications([]);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    fetchNotifications();
    connectNotificationSocket(auth.user.id, auth.token);

    return () => {
      if (notificationSocketRef.current) {
        notificationSocketRef.current.close();
      }
    };
  }, [auth.user?.id, auth.token, connectNotificationSocket]);

  useEffect(() => {
    // Crea el elemento de audio
    notificationSoundRef.current = new Audio();
    notificationSoundRef.current.src = '/cartoon014.mp3';
    notificationSoundRef.current.load(); // Precarga el audio
    notificationSoundRef.current.volume = 0.3;

    // Maneja errores de carga
    notificationSoundRef.current.addEventListener('error', (e) => {
      console.error('Error al cargar el sonido:', e);
    });

    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
        notificationSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!auth.user?.id || !auth.token) return;

    // Verificar token periódicamente (cada minuto)
    const interval = setInterval(() => {
      auth.checkTokenExpiration();
    }, 60000);

    return () => clearInterval(interval);
  }, [auth.user?.id, auth.token]);

  // Cerrar todas las conexiones al desmontar
  useEffect(() => {
    return () => {
      Object.values(socketsRef.current).forEach(socket => socket.close());
    };
  }, []);

  const contextValue = {
    ...auth,
    subscribeToPostUpdates,
    unsubscribeFromPostUpdates,
    notifications,
    wsNotifications, // Expón las notificaciones de WebSocket por separado
    unreadCount: notifications.reduce((count, n) => count + (n.read ? 0 : 1), 0),
    markAsRead,
    markAllAsRead,
    isNotificationsLoading,
    user: auth.user,
    subscribeToImageUpdates,
    unsubscribeFromImageUpdates
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}