import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginUser, createUser, getUserById } from "../infrastructure/UserApi";
import type { UserLogin, UserCreateRequest, LoginResponse, User } from "../domain/User";

export function useUser(userId: number) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId, localStorage.getItem('token') || ''),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar en 404
      if (error.message.includes('404') || error.message.includes('No hay token disponible')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserCreateRequest) => {
      // Necesitas obtener el token de un admin para crear usuario
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Se requiere autenticación para crear usuarios');
      return createUser(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

export function useLoginUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data: LoginResponse) => {
      // Guardar token (actualizado según tu API)
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('tokenType', data.tokenType);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });
}