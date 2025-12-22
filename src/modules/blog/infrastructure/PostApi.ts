// En src/infrastructure/PostApi.ts
import type {
  Post,
  PostCreateRequest,
  PostUpdateRequest,
  PostsListResponse,
  Category,
  Comment,
  CommentCreateRequest,
  CommentsListResponse,
  PostListParams
} from "../domain/Post";

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

// ============ POST ENDPOINTS ============

export async function createPost(data: PostCreateRequest, token: string): Promise<Post> {
  const response = await fetch(`${API_URL}/post/create_post`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear publicación");
  }
  
  return response.json();
}

export async function getPostById(postId: number, token: string): Promise<Post> {
  const response = await fetch(`${API_URL}/post/read_post/${postId}`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener publicación');
  }

  return response.json();
}

export async function listPosts(
  params: PostListParams = {},
  token: string
): Promise<PostsListResponse> {
  // Construir query string
  const queryParams = new URLSearchParams();
  
  if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.userId) queryParams.append('userId', params.userId.toString());
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/post/list_posts${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al listar publicaciones');
  }

  return response.json();
}

export async function updatePost(
  postId: number,
  data: PostUpdateRequest,
  token: string
): Promise<Post> {
  const response = await fetch(`${API_URL}/post/update_post/${postId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar publicación');
  }

  return response.json();
}

export async function deletePost(
  postId: number,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/post/delete_post/${postId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar publicación');
  }

  // Si la respuesta es 204 No Content, devolvemos un objeto vacío
  if (response.status === 204) {
    return { message: 'Publicación eliminada exitosamente' };
  }

  // Si la respuesta tiene contenido, intentamos parsearlo como JSON
  try {
    return await response.json();
  } catch {
    // Si no se puede parsear como JSON pero la respuesta fue exitosa
    return { message: 'Publicación eliminada exitosamente' };
  }
}

// ============ CATEGORY ENDPOINTS ============

export async function listCategories(token: string): Promise<Category[]> {
  const response = await fetch(`${API_URL}/category/list_categories`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al listar categorías');
  }

  return response.json();
}

export async function createCategory(name: string, token: string): Promise<Category> {
  const response = await fetch(`${API_URL}/category/create_category`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear categoría');
  }

  return response.json();
}

// ============ COMMENT ENDPOINTS ============

export async function createComment(
  data: CommentCreateRequest,
  token: string
): Promise<Comment> {
  const response = await fetch(`${API_URL}/comment/create_comment`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear comentario');
  }

  return response.json();
}

export async function getCommentById(
  commentId: number,
  token: string
): Promise<Comment> {
  const response = await fetch(`${API_URL}/comment/read_comment/${commentId}`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener comentario');
  }

  return response.json();
}

export async function listCommentsByPost(
  postId: number,
  params: { page?: number; size?: number } = {},
  token: string
): Promise<CommentsListResponse> {
  // Construir query string
  const queryParams = new URLSearchParams();
  queryParams.append('postId', postId.toString());
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/comment/list_comments_by_post${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al listar comentarios');
  }

  return response.json();
}

export async function deleteComment(
  commentId: number,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/comment/delete_comment/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar comentario');
  }

  // Manejar 204 No Content
  if (response.status === 204) {
    return { message: 'Comentario eliminado exitosamente' };
  }

  try {
    return await response.json();
  } catch {
    return { message: 'Comentario eliminado exitosamente' };
  }
}

// Función deprecated - mantener por compatibilidad temporal
export async function getPostComments(
  postId: number,
  token: string
): Promise<Comment[]> {
  const response = await listCommentsByPost(postId, {}, token);
  return response.content;
}