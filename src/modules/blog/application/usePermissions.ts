// En src/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { 
  getUserPermissions, 
  ROLE_PERMISSIONS, 
  type Permissions,
  type ExtendedPermissions 
} from '../domain/User';

export function usePermissions(): ExtendedPermissions {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) {
      // Usuario no autenticado - permisos mínimos
      const guestPermissions = {
        ...ROLE_PERMISSIONS.GUEST,
        canViewDashboard: false,
        canViewOwnProfile: false,
        canEditOwnProfile: false,
        canCreatePosts: false,
      } as Permissions;
      
      return {
        ...guestPermissions,
        // Funciones helper para guest
        canDeletePost: () => false,
        canEditPost: () => false,
        canChangeOwnProfile: false,
        canViewOtherUsers: false,
        canCreateAdmin: false,
        canCreateSuperadmin: false,
        roleName: 'Invitado',
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      };
    }
    
    const permissions = getUserPermissions(user);
    
    // Función para verificar si el usuario puede eliminar un post específico
    const canDeletePost = (postUserId: number): boolean => {
      // Superadmins pueden eliminar cualquier post
      if (user.isSuperadmin) return true;
      // Admins pueden eliminar cualquier post
      if (user.isAdmin && permissions.canDeletePosts) return true;
      // Usuarios solo pueden eliminar sus propios posts
      return user.id === postUserId;
    };
    
    // Función para verificar si el usuario puede editar un post específico
    const canEditPost = (postUserId: number): boolean => {
      // Superadmins pueden editar cualquier post
      if (user.isSuperadmin) return true;
      // Admins pueden editar cualquier post si tienen permiso
      if (user.isAdmin && permissions.canEditAllPosts) return true;
      // Usuarios solo pueden editar sus propios posts
      return user.id === postUserId;
    };

    return {
      ...permissions,
      // Funciones helper específicas
      canDeletePost,
      canEditPost,
      
      // Permisos especiales condicionales
      canChangeOwnProfile: true, // Todos pueden cambiar su propio perfil
      canViewOtherUsers: permissions.canViewUsers,
      canCreateAdmin: user.isSuperadmin,
      canCreateSuperadmin: user.isSuperadmin,
      
      // Helper para UI
      roleName: user.isSuperadmin ? 'Super Administrador' : 
                user.isAdmin ? 'Administrador' : 'Usuario',
      
      // Helper para verificar múltiples permisos
      hasAnyPermission: (requiredPermissions: (keyof Permissions)[]) => {
        return requiredPermissions.some(permission => 
          permissions[permission] === true
        );
      },
      
      hasAllPermissions: (requiredPermissions: (keyof Permissions)[]) => {
        return requiredPermissions.every(permission => 
          permissions[permission] === true
        );
      }
    } as ExtendedPermissions;
  }, [user]);
}