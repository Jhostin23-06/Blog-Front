import type { Notification } from '../domain/Notification';

const API_BASE_URL = import.meta.env.VITE_API_NOTIFI || 'http://localhost:8000/api';

interface ApiError {
    message: string;
    status?: number;
}

/**
 * Cliente HTTP personalizado con fetch
 */
const httpClient = {
    async get<T>(endpoint: string): Promise<T> {
        return this.request('GET', endpoint);
    },

    async post<T>(endpoint: string, body?: object): Promise<T> {
        return this.request('POST', endpoint, body);
    },

    async request<T>(method: string, endpoint: string, body?: object): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        });

        const config: RequestInit = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await this.parseError(response);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json() as T;
        } catch (error) {
            console.error(`API request failed: ${method} ${url}`, error);
            throw this.normalizeError(error);
        }
    },

    async parseError(response: Response): Promise<{ message: string }> {
        try {
            return await response.json();
        } catch {
            return { message: response.statusText };
        }
    },

    normalizeError(error: unknown): ApiError {
        if (error instanceof Error) {
            return { message: error.message };
        }
        return { message: 'Unknown error occurred' };
    }
};

export const NotificationApi = {
    /**
     * Obtiene todas las notificaciones del usuario
     */
    async getAll(): Promise<Notification[]> {
        return httpClient.get<Notification[]>('/api/notifications');
    },

    /**
     * Marca notificaciones como leídas
     * @param notificationIds Array de IDs de notificaciones
     */
    async markAsRead(notificationIds: string[]): Promise<void> {
        return httpClient.post<void>('/api/notifications/mark-as-read', { notificationIds });
    },

    /**
     * Suscripción a notificaciones en tiempo real
     * @param userId ID del usuario
     * @param callback Función que se ejecuta al recibir una notificación
     * @returns Función para cerrar la conexión
     */
    subscribeToRealtime(
        userId: string,
        callback: (notification: Notification) => void
    ): () => void {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = API_BASE_URL.replace(/^https?:\/\//, '');
        const socket = new WebSocket(`${protocol}//${host}/ws/notifications/${userId}`);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'new_notification') {
                    callback(data.data);
                }
            } catch (error) {
                console.error('Error parsing notification:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => socket.close();
    }
};