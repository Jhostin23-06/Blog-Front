import type { Comment, CommentCreate } from "../domain/Comment";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"; // Cambia por tu URL real

// Obtener comentarios de un post
export async function getComments(postId: string): Promise<Comment[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/comments/post/${postId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error("Error al obtener comentarios");
  return response.json();
}

// Crear un comentario
export async function createComment(comment: CommentCreate): Promise<Comment> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");
  const response = await fetch(`${API_URL}/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(comment),
  });
  if (!response.ok) throw new Error("Error al crear comentario");
  return response.json();
}

// Eliminar un comentario
export async function deleteComment(commentId: string): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al eliminar comentario");
}