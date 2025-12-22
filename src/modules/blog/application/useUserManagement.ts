// En src/hooks/useUserManagement.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, createUser, updateUserRole, deleteUser } from "../infrastructure/UserApi";
import { usePermissions } from "./usePermissions";
import type { UserCreateRequest, UpdateRoleRequest } from "../domain/User";

export function useUserManagement() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const permissions = usePermissions();
  
  // Solo cargar usuarios si el usuario tiene permiso
  const shouldFetchUsers = !!token && permissions.canViewUsers;

  // Query para listar usuarios
  const usersQuery = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      if (!permissions.canViewUsers) {
        throw new Error('No tienes permisos para ver la lista de usuarios');
      }
      return listUsers(token);
    },
    enabled: shouldFetchUsers,
    staleTime: 5 * 60 * 1000,
  });

  // Mutación para crear usuario
  const createUserMutation = useMutation({
    mutationFn: async (data: UserCreateRequest) => {
      if (!token) throw new Error('No hay token disponible');
      
      // Validar permisos para crear ciertos roles
      if (data.role === 'ADMIN' && !permissions.canCreateAdmin) {
        throw new Error('No tienes permisos para crear administradores');
      }
      
      if (data.role === 'SUPERADMIN' && !permissions.canCreateSuperadmin) {
        throw new Error('No tienes permisos para crear super administradores');
      }
      
      return createUser(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  // Mutación para actualizar rol (solo Superadmin)
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'USER' | 'ADMIN' | 'SUPERADMIN' }) => {
      if (!token) throw new Error('No hay token disponible');
      if (!permissions.canChangeRoles) {
        throw new Error('Solo los Super Administradores pueden cambiar roles');
      }
      
      const data: UpdateRoleRequest = { role };
      return updateUserRole(userId, data, token);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  // Mutación para eliminar usuario (solo Superadmin)
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => {
      if (!token) throw new Error('No hay token disponible');
      if (!permissions.canDeleteUsers) {
        throw new Error('Solo los Super Administradores pueden eliminar usuarios');
      }
      return deleteUser(userId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  return {
    // Datos
    users: usersQuery.data || [],
    
    // Estados de query
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    
    // Permisos específicos de gestión de usuarios
    canViewUsers: permissions.canViewUsers,
    canCreateUsers: permissions.canCreateUsers,
    canCreateAdmin: permissions.canCreateAdmin,
    canCreateSuperadmin: permissions.canCreateSuperadmin,
    canChangeRoles: permissions.canChangeRoles,
    canDeleteUsers: permissions.canDeleteUsers,
    
    // Mutaciones
    createUser: createUserMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    
    // Estados de mutaciones
    isCreating: createUserMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    
    // Refetch
    refetchUsers: usersQuery.refetch,
  };
}