import type { 
  LoginResponse, 
  User, 
  UserLogin, 
  UserRegister, 
  UserCreateRequest,
  UserUpdate, 
  ChangePasswordRequest,
  UpdateRoleRequest,
  PublicUserRegisterResponse,
  PublicUserRegisterRequest
} from "../domain/User";

const isDevelopment = import.meta.env.DEV;

const API_URL = isDevelopment 
  ? '/api'  // Usará el proxy de Vite
  : import.meta.env.VITE_API_URL || 'https://tech-blog-kz8g.onrender.com/api';

// Helper para construir headers
const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "accept": "*/*"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// ============ AUTH ENDPOINTS ============
export async function loginUser(data: UserLogin): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Credenciales inválidas");
  }
  
  return response.json();
}

// ============ USER ENDPOINTS ============

// CREATE USER (requiere token de admin)
export async function createUser(data: UserCreateRequest, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/create_user`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear usuario");
  }
  
  return response.json();
}

// GET CURRENT USER
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/me`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener usuario actual');
  }

  return response.json();
}

// GET USER BY ID
export async function getUserById(userId: string, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/read_user/${userId}`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener usuario');
  }

  return response.json();
}

// UPDATE USER
export async function updateUser(
  userId: number,
  data: UserUpdate,
  token: string
): Promise<User> {
  const response = await fetch(`${API_URL}/user/update_user/${userId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar usuario');
  }

  return response.json();
}

// CHANGE PASSWORD
export async function changeUserPassword(
  userId: number,
  data: ChangePasswordRequest,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/user/change_password/${userId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cambiar contraseña');
  }

  return response.json();
}

// UPDATE USER ROLE
export async function updateUserRole(
  userId: number,
  data: UpdateRoleRequest,
  token: string
): Promise<User> {
  const response = await fetch(`${API_URL}/user/update_user_role/${userId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar rol');
  }

  return response.json();
}

// LIST USERS
export async function listUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/user/list_users`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al listar usuarios');
  }

  return response.json();
}

// DELETE USER
export async function deleteUser(
  userId: number,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/user/delete_user/${userId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar usuario');
  }

  return response.json();
}

export async function registerPublicUser(
  data: { username: string; email: string; password: string }
): Promise<PublicUserRegisterResponse> {
  console.log('Registering user with data:', data);
  
  const response = await fetch(`${API_URL}/public/own_register_user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(data),
  });

  console.log('Registration response status:', response.status);
  console.log('Registration response headers:', Object.fromEntries(response.headers.entries()));

  // Si es 403, es un problema de permisos en el backend
  if (response.status === 403) {
    throw new Error('Acceso denegado. El endpoint de registro no está disponible.');
  }

  // Si es 204 No Content, pero esperamos un usuario
  if (response.status === 204) {
    throw new Error('El servidor no devolvió datos. Contacta al administrador.');
  }

  if (!response.ok) {
    // Intentar obtener mensaje de error si existe
    const errorText = await response.text();
    console.error('Registration error response text:', errorText);
    
    let errorMessage = `Error ${response.status}: Registro fallido`;
    
    try {
      if (errorText) {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      }
    } catch {
      // Si no es JSON, usar el texto como mensaje
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
  }

  // Intentar parsear la respuesta
  try {
    const responseText = await response.text();
    console.log('Registration response text:', responseText);
    
    if (!responseText) {
      throw new Error('El servidor no devolvió datos');
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error parsing registration response:', error);
    throw new Error('Error procesando la respuesta del servidor');
  }
}