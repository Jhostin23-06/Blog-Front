import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  loginUser, 
  getCurrentUser,
  createUser,
  updateUser,
  changeUserPassword,
  listUsers,
  deleteUser,
  updateUserRole,
  getUserById
} from "../infrastructure/UserApi";
import type { 
  UserLogin, 
  UserCreateRequest,
  UserUpdate, 
  LoginResponse, 
  User,
  ChangePasswordRequest,
  UpdateRoleRequest
} from "../domain/User";
import { useEffect, useState, useCallback } from "react";
import { getUserRole } from "../domain/User";

export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('token')
  );

  // ============ QUERIES ============

  // Query para usuario actual
  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      if (!token) throw new Error('No hay token disponible');
      return getCurrentUser(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Query para obtener usuario por ID
  const useUserById = (userId: string) => {
    return useQuery({
      queryKey: ['user', userId],
      queryFn: () => {
        if (!token) throw new Error('No hay token disponible');
        return getUserById(userId, token);
      },
      enabled: !!userId && !!token,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query para listar usuarios
  const useUsersList = () => {
    return useQuery({
      queryKey: ['users', 'list'],
      queryFn: () => {
        if (!token) throw new Error('No hay token disponible');
        return listUsers(token);
      },
      enabled: !!token,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ============ MUTATIONS ============

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('tokenType', data.tokenType);
      setToken(data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error) => {
      console.error('Login error:', error.message);
    }
  });

  // Create user mutation (admin only)
  const createUserMutation = useMutation({
    mutationFn: ({ data }: { data: UserCreateRequest }) => {
      if (!token) throw new Error('No hay token disponible');
      return createUser(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (error: Error) => {
      console.error('Create user error:', error.message);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdate }) => {
      if (!token) throw new Error('No hay token disponible');
      return updateUser(userId, data, token);
    },
    onSuccess: (updatedUser, variables) => {
      // Actualizar cache del usuario actual si es el mismo
      if (currentUserQuery.data?.id === variables.userId) {
        queryClient.setQueryData(['currentUser'], updatedUser);
      }
      // Actualizar cache del usuario específico
      queryClient.setQueryData(['user', variables.userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (error: Error) => {
      console.error('Update user error:', error.message);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: ChangePasswordRequest }) => {
      if (!token) throw new Error('No hay token disponible');
      return changeUserPassword(userId, data, token);
    },
    onError: (error: Error) => {
      console.error('Change password error:', error.message);
    }
  });

  // Update role mutation (admin only)
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'USER' | 'ADMIN' | 'SUPERADMIN' }) => {
      if (!token) throw new Error('No hay token disponible');
      const data: UpdateRoleRequest = { role };
      return updateUserRole(userId, data, token);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (error: Error) => {
      console.error('Update role error:', error.message);
    }
  });

  // Delete user mutation (admin only)
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => {
      if (!token) throw new Error('No hay token disponible');
      return deleteUser(userId, token);
    },
    onSuccess: (_, userId) => {
      // Si se elimina el usuario actual, hacer logout
      if (currentUserQuery.data?.id === userId) {
        logout();
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.removeQueries({ queryKey: ['user', userId] });
    },
    onError: (error: Error) => {
      console.error('Delete user error:', error.message);
    }
  });

  // ============ FUNCTIONS ============

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    setToken(null);
    queryClient.clear();
    queryClient.invalidateQueries();
    // Redirigir a login
    window.location.href = '/login';
  }, [queryClient]);

  // Check authentication
  const isAuthenticated = useCallback((): boolean => {
    return !!token && !!currentUserQuery.data;
  }, [token, currentUserQuery.data]);

  // Check if user has specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!currentUserQuery.data) return false;
    const userRole = getUserRole(currentUserQuery.data);
    return userRole === role;
  }, [currentUserQuery.data]);

  // Check if user is admin or superadmin
  const isAdmin = useCallback((): boolean => {
    if (!currentUserQuery.data) return false;
    return currentUserQuery.data.isAdmin || currentUserQuery.data.isSuperadmin;
  }, [currentUserQuery.data]);

  // Check if user is superadmin
  const isSuperadmin = useCallback((): boolean => {
    return currentUserQuery.data?.isSuperadmin || false;
  }, [currentUserQuery.data]);

  // ============ EFFECTS ============

  // Check token expiration periodically
  useEffect(() => {
    if (!token) return;

    const checkToken = () => {
      try {
        // Decode token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        
        if (Date.now() > expirationTime) {
          logout();
        }
      } catch (error) {
        console.error('Error checking token:', error);
        logout();
      }
    };

    // Check immediately
    checkToken();
    
    // Check every minute
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [token, logout]);

  // ============ RETURN ============

  return {
    // User data
    user: currentUserQuery.data,
    token,
    
    // Loading states
    isLoading: loginMutation.isPending || currentUserQuery.isLoading,
    isAuthenticated: isAuthenticated(),
    
    // Role checks
    hasRole,
    isAdmin: isAdmin(),
    isSuperadmin: isSuperadmin(),
    
    // Queries
    useUserById,
    useUsersList,
    
    // Mutations
    login: loginMutation.mutateAsync,
    createUser: (data: UserCreateRequest) => createUserMutation.mutateAsync({ data }),
    updateUser: (userId: number, data: UserUpdate) => 
      updateUserMutation.mutateAsync({ userId, data }),
    changePassword: (userId: number, data: ChangePasswordRequest) =>
      changePasswordMutation.mutateAsync({ userId, data }),
    updateRole: (userId: number, role: 'USER' | 'ADMIN' | 'SUPERADMIN') =>
      updateRoleMutation.mutateAsync({ userId, role }),
    deleteUser: deleteUserMutation.mutateAsync,
    
    // Functions
    logout,
    
    // Refetch
    refetchUser: currentUserQuery.refetch,
    
    // Errors
    loginError: loginMutation.error,
    currentUserError: currentUserQuery.error,
  };
}