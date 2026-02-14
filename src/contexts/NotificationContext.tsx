import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Notification } from "../types/notification";
import * as notificationService from "../services/notificationService";
import { useAuth } from "../hooks/useAuth";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

const POLLING_INTERVAL = 90000; // 90 secondi

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread count (per il badge) - chiamata leggera
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuthenticated]);

  // Fetch all notifications (chiamata quando serve la lista)
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const data = await notificationService.getNotifications(20);
      setNotifications(data);
      // Aggiorna anche il count
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark single as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Aggiorna lo stato locale
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Aggiorna lo stato locale
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      throw error;
    }
  }, []);

  // Delete single notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);

        // Aggiorna lo stato locale
        const deletedNotification = notifications.find(
          (n) => n._id === notificationId,
        );

        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId),
        );

        // Se era unread, decrementa il counter
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
        throw error;
      }
    },
    [notifications],
  );

  // Clear all read notifications
  const clearReadNotifications = useCallback(async () => {
    try {
      await notificationService.clearReadNotifications();

      // Rimuovi tutte le notifiche lette dallo stato locale
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
      throw error;
    }
  }, []);

  // Polling automatico ogni 90 secondi per il count
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Fetch iniziale
    fetchUnreadCount();

    // Setup polling
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  // Ferma polling quando tab è inattivo (ottimizzazione)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab tornato attivo, fetch immediato
        fetchUnreadCount();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook esportato da hooks/useNotifications.ts
// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
