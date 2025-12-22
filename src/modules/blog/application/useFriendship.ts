import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  getUserFriends
} from "../infrastructure/FriendshipApi";
import { useAuthContext } from "../../../context/AuthContext";
//import { useAuth } from "./useAuth";
import type { FriendRequest } from "../domain/User";

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: (userId: string) => sendFriendRequest(userId),
    onMutate: async (userId) => {
      // 1. Cancelar todas las queries relevantes
      await queryClient.cancelQueries({ queryKey: ['user', user?.id] });
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      // 2. Guardar el estado anterior para posible rollback
      const previousCurrentUser = queryClient.getQueryData(['user', user?.id]);
      const previousTargetUser = queryClient.getQueryData(['user', userId]);

      // 3. Actualización optimista del usuario actual (quien envía la solicitud)
      queryClient.setQueryData(['user', user?.id], (old: any) => ({
        ...old,
        sent_requests: [...(old?.sent_requests || []), userId],
        relationships: {
          ...old?.relationships,
          [userId]: "request_sent"
        }
      }));

      // 4. Actualización optimista del usuario objetivo (quien recibe la solicitud)
      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        friend_requests: [...(old?.friend_requests || []), user?.id],
        relationships: {
          ...old?.relationships,
          [user?.id]: "request_received"
        }
      }));

      return { previousCurrentUser, previousTargetUser };
      
    },
    onSuccess: (data, userId) => {
      // Actualizar con datos reales del servidor si es necesario
      if (data?.updatedUsers) {
        queryClient.setQueryData(['user', user?.id], data.updatedUsers.sender);
        queryClient.setQueryData(['user', userId], data.updatedUsers.receiver);
      }
    },
    onSettled: (userId) => {
      // Invalidar queries para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  return useMutation({
    mutationFn: (userId: string) => acceptFriendRequest(userId),
    onMutate: async (userId) => {
      // Cancelar todas las queries relevantes
      await queryClient.cancelQueries({ queryKey: ['user', user?.id] });
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      await queryClient.cancelQueries({ queryKey: ['friends'] });
      await queryClient.cancelQueries({ queryKey: ['friendRequests'] });

      // Snapshots del estado anterior
      const previousCurrentUser = queryClient.getQueryData(['user', user?.id]);
      const previousTargetUser = queryClient.getQueryData(['user', userId]);
      const previousFriends = queryClient.getQueryData(['friends']);
      const previousRequests = queryClient.getQueryData(['friendRequests']);

      // Actualización optimista del usuario actual
      queryClient.setQueryData(['user', user?.id], (old: any) => ({
        ...old,
        friends: [...(old?.friends || []), userId],
        friend_requests: (old?.friend_requests || []).filter((id: string) => id !== userId),
        relationships: {
          ...old?.relationships,
          [userId]: "friend"
        }
      }));

      // Actualización optimista del usuario objetivo (si está en caché)
      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        friends: [...(old?.friends || []), user?.id],
        relationships: {
          ...old?.relationships,
          [user?.id]: "friend"
        }
      }));

      // Actualización optimista de la lista de amigos
      queryClient.setQueryData(['friends'], (old: any) => [
        ...(old || []),
        { id: userId } // Aquí deberías incluir los datos completos del nuevo amigo si los tienes
      ]);

      // Actualización optimista de las solicitudes
      queryClient.setQueryData(['friendRequests'], (old: any) =>
        (old || []).filter((req: FriendRequest) => req.id !== userId)
      );

      return { previousCurrentUser, previousTargetUser, previousFriends, previousRequests };
    },
    onError: (_, userId, context) => {
      // Revertir todos los cambios en caso de error
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(['user', user?.id], context.previousCurrentUser);
      }
      if (context?.previousTargetUser) {
        queryClient.setQueryData(['user', userId], context.previousTargetUser);
      }
      if (context?.previousFriends) {
        queryClient.setQueryData(['friends'], context.previousFriends);
      }
      if (context?.previousRequests) {
        queryClient.setQueryData(['friendRequests'], context.previousRequests);
      }
    },
    onSuccess: (data, userId) => {
      // Actualizar con datos reales del servidor si es necesario
      if (data?.updatedUsers) {
        queryClient.setQueryData(['user', user?.id], data.updatedUsers.currentUser);
        queryClient.setQueryData(['user', userId], data.updatedUsers.targetUser);
      }
    },
    onSettled: (userId) => {
      // Invalidar queries para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    }
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => rejectFriendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

// export function useFriendRequests() {
//   const { user } = useAuthContext();

//   console.log('USUARIO ACTIVO', user)

//   return useQuery<FriendRequest[], Error>({
//     queryKey: ['friendRequests', user?.id],
//     queryFn: async () => {
//       try {
//         console.log("Iniciando petición de friend requests...");
//         const response = await getFriendRequests();
//         console.log("Respuesta completa de la API:", response);

//         // Verificación exhaustiva de la respuesta
//         if (!response) {
//           console.warn('La respuesta está vacía o es undefined');
//           return [];
//         }

//         if (!Array.isArray(response)) {
//           console.warn('La respuesta no es un array:', response);
//           return [];
//         }

//         // Verificar la estructura de cada elemento
//         const validatedResponse = response.map(item => ({
//           id: item.id || '',
//           username: item.username || 'Usuario desconocido',
//           profile_picture: item.profile_picture || '',
//           bio: item.bio || '',
//           cover_photo: item.cover_photo || ''
//         }));

//         return validatedResponse;
//       } catch (error) {
//         console.error("Error detallado en useFriendRequests:", error);
//         throw new Error('No se pudieron cargar las solicitudes de amistad');
//       }
//     },
//     enabled: !!user?.id,  // Más estricto que solo !!user
//     retry: 2,  // Reintentar 2 veces antes de dar error
//     refetchOnWindowFocus: true  // Recargar cuando la ventana gana foco
//   });
// }

export function useFriendRequests() {
  const { user } = useAuthContext();

  return useQuery<FriendRequest[], Error>({
    queryKey: ['friendRequests', user?.id],
    queryFn: async () => {
      const response = await getFriendRequests();

      // Validación de la respuesta
      if (!Array.isArray(response)) {
        throw new Error('La respuesta no es un array válido');
      }

      return response.map(item => ({
        id: item.id,
        username: item.username || 'Usuario desconocido',
        profile_picture: item.profile_picture || '',
        bio: item.bio || '',
        cover_photo: item.cover_photo || ''
      }));


    },
    enabled: !!user?.id && !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000, // 5 minutos de stale time
    retry: (failureCount, error) => {
      // No reintentar para errores de validación
      if (error.message.includes('no es un array válido')) return false;
      return failureCount < 3; // Reintentar hasta 3 veces para otros errores
    },
    refetchOnWindowFocus: true,
  });
}

export function useFriends() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: () => getFriends(),
    enabled: !!user?.id && !!localStorage.getItem("token"),
  });
}

export function useUserFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ['userFriends', userId],
    queryFn: () => getUserFriends(userId as string),
    enabled: !!userId,
  });
}