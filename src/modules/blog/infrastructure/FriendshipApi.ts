const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function sendFriendRequest(userId: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/request/${userId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al enviar solicitud");
  }

  return response.json(); // Retorna { message: string }
}

export async function acceptFriendRequest(userId: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/accept/${userId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al aceptar solicitud");
  }

  return response.json(); // Retorna { message: string }
}

export async function rejectFriendRequest(userId: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/reject/${userId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al rechazar solicitud");
  }

  return response.json(); // Retorna { message: string }
}

export async function getFriendRequests() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_URL}/friends/requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });


    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch friend requests');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getFriends(): Promise<Array<{
  id: string;
  username: string;
  profile_picture: string;
  bio?: string;
  cover_photo?: string;
}>> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al obtener amigos");
  }

  return response.json();
}

// Función adicional recomendada para obtener el estado de una relación específica
export async function getRelationshipStatus(userId: string): Promise<{
  status: "friend" | "request_received" | "request_sent" | "none";
}> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/status/${userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al obtener estado de relación");
  }

  return response.json();
}

export async function getUserFriends(userId: string): Promise<Array<{
  id: string;
  username: string;
  profile_picture: string;
  bio?: string;
  cover_photo?: string;
}>> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/user/${userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al obtener amigos del usuario");
  }

  return response.json();
}