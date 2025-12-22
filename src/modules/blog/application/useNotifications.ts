
import { useAuthContext } from "../../../context/AuthContext";

export function useNotifications() {
    const {
        notifications: contextNotifications,
        unreadCount: contextUnreadCount,
        markAsRead: contextMarkAsRead,
        markAllAsRead: contextMarkAllAsRead,
        isNotificationsLoading: contextIsLoading
    } = useAuthContext();

    // Usa directamente los valores del contexto en lugar de duplicar la lógica
    return {
        notifications: contextNotifications,
        isLoading: contextIsLoading,
        unreadCount: contextUnreadCount,
        markAsRead: contextMarkAsRead,
        markAllAsRead: contextMarkAllAsRead,
    };
}