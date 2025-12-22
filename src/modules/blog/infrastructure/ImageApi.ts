// src/infrastructure/ImageApi.ts
import type { IImage, ImageUploadType, ImageUploadResponse } from "../domain/Image";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function uploadProfilePicture(file: File): Promise<ImageUploadResponse> {
  return uploadImage(file, 'profile_picture');
}

export async function uploadCoverPhoto(file: File): Promise<ImageUploadResponse> {
  return uploadImage(file, 'cover_photo');
}

async function uploadImage(file: File, imageType: ImageUploadType): Promise<ImageUploadResponse> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No autenticado');

  const formData = new FormData();
  formData.append('file', file);

  const endpoint = imageType === 'profile_picture'
    ? `${API_URL}/images/profile-picture`
    : `${API_URL}/images/cover-photo`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al subir imagen');
  }

  return response.json();
}

export async function getUserImages(userId: string): Promise<IImage[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/images/user/${userId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) throw new Error("Error al obtener imágenes");
  return response.json();
}

export async function getImageDetails(imageId: string): Promise<IImage> {
  const response = await fetch(`${API_URL}/images/${imageId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener detalles de la imagen');
  }

  return response.json();
}

export async function deleteImage(imageId: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar la imagen');
  }
}

export async function getImageComments(imageId: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/images/${imageId}/comments`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) throw new Error("Error al obtener comentarios");
  return response.json();
}

export async function postImageComment(imageId: string, content: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/images/${imageId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new Error("Error al publicar comentario");
  return response.json();
}

export async function likeImage(imageId: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/images/${imageId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Error al dar like");
  return response.json();
}

export async function unlikeImage(imageId: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/images/${imageId}/unlike`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Error al quitar like");
  return response.json();
}