// Interfaces para tu API de Spring Boot con MySQL
export interface User {
  id: number; // Cambiar a number (MySQL usa números)
  username: string;
  email: string;
  isUser: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
  path?: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  // Agregar otros campos que puedas actualizar
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

// Definición de permisos por rol
export const ROLE_PERMISSIONS = {
  SUPERADMIN: {
    canViewDashboard: true,
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canCreatePosts: true,
    canViewPosts: true,
    canComment: true,
    canLike: true,
    canDeletePosts: true,
    canManagePosts: true,
    canEditAllPosts: true,
    canFeaturePosts: true,
    canViewUsers: true,
    canCreateUsers: true,
    canManageUsers: true,
    canChangeRoles: true,
    canDeleteUsers: true,
    canManageCategories: true,
    canCreateCategories: true,
  },
  ADMIN: {
    canViewDashboard: true,
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canCreatePosts: true,
    canViewPosts: true,
    canComment: true,
    canLike: true,
    canDeletePosts: true,
    canManagePosts: true,
    canEditAllPosts: true,
    canFeaturePosts: true,
    canViewUsers: true,
    canCreateUsers: true,
    canManageUsers: true,
    canChangeRoles: false,
    canDeleteUsers: false,
    canManageCategories: true,
    canCreateCategories: true,
  },
  USER: {
    canViewDashboard: true,
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canCreatePosts: true,
    canViewPosts: true,
    canComment: true,
    canLike: true,
    canDeletePosts: false,
    canManagePosts: false,
    canEditAllPosts: false,
    canFeaturePosts: false,
    canViewUsers: false,
    canCreateUsers: false,
    canManageUsers: false,
    canChangeRoles: false,
    canDeleteUsers: false,
    canManageCategories: false,
    canCreateCategories: false,
  },
  GUEST: {
    canViewDashboard: false,
    canViewOwnProfile: false,
    canEditOwnProfile: false,
    canCreatePosts: false,
    canViewPosts: true,
    canComment: false,
    canLike: false,
    canDeletePosts: false,
    canManagePosts: false,
    canEditAllPosts: false,
    canFeaturePosts: false,
    canViewUsers: false,
    canCreateUsers: false,
    canManageUsers: false,
    canChangeRoles: false,
    canDeleteUsers: false,
    canManageCategories: false,
    canCreateCategories: false,
  },
} as const;


export interface UpdateRoleRequest {
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

// En src/domain/User.ts
export interface Permissions {
  // Permisos básicos
  canViewDashboard: boolean;
  canViewOwnProfile: boolean;
  canEditOwnProfile: boolean;
  canCreatePosts: boolean;
  canViewPosts: boolean;
  canComment: boolean;
  canLike: boolean;
  
  // Permisos de gestión de posts
  canDeletePosts: boolean;
  canManagePosts: boolean;
  canEditAllPosts: boolean;
  canFeaturePosts: boolean;
  
  // Permisos de administración de usuarios
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canManageUsers: boolean;
  canChangeRoles: boolean;
  canDeleteUsers: boolean;
}

export interface PublicUserRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface PublicUserRegisterResponse {
  id: number;
  username: string;
  email: string;
  isUser: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExtendedPermissions extends Permissions {
  // Funciones helper específicas
  canDeletePost: (postUserId: number) => boolean;
  canEditPost: (postUserId: number) => boolean;
  
  // Permisos especiales condicionales
  canChangeOwnProfile: boolean;
  canViewOtherUsers: boolean;
  canCreateAdmin: boolean;
  canCreateSuperadmin: boolean;
  
  // Helper para UI
  roleName: string;
  
  // Helper para verificar múltiples permisos
  hasAnyPermission: (requiredPermissions: (keyof Permissions)[]) => boolean;
  hasAllPermissions: (requiredPermissions: (keyof Permissions)[]) => boolean;
}

// Helper para determinar el rol
export const getUserRole = (user: User): string => {
  if (user.isSuperadmin) return 'SUPERADMIN';
  if (user.isAdmin) return 'ADMIN';
  return 'USER';
};

export const getUserPermissions = (user: User) => {
  if (user.isSuperadmin) return ROLE_PERMISSIONS.SUPERADMIN;
  if (user.isAdmin) return ROLE_PERMISSIONS.ADMIN;
  return ROLE_PERMISSIONS.USER;
};

// Helper para convertir rol string a booleans
export const roleToBooleans = (role: string) => {
  return {
    isUser: role === 'USER',
    isAdmin: role === 'ADMIN',
    isSuperadmin: role === 'SUPERADMIN'
  };
};