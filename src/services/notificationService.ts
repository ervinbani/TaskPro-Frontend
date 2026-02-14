import api from "./api";
import type {
  Notification,
  NotificationCountResponse,
  MarkAllReadResponse,
  DeleteResponse,
} from "../types/notification";

// Get unread count (per il badge)
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<NotificationCountResponse>(
    "/api/notifications/unread/count",
  );
  return response.data.count;
};

// Get all notifications (con limit opzionale)
export const getNotifications = async (
  limit: number = 20,
): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(
    `/api/notifications?limit=${limit}`,
  );
  return response.data;
};

// Mark single notification as read
export const markAsRead = async (
  notificationId: string,
): Promise<Notification> => {
  const response = await api.put<Notification>(
    `/api/notifications/${notificationId}/read`,
  );
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<number> => {
  const response = await api.put<MarkAllReadResponse>(
    "/api/notifications/mark-all-read",
  );
  return response.data.modifiedCount;
};

// Delete single notification
export const deleteNotification = async (
  notificationId: string,
): Promise<void> => {
  await api.delete(`/api/notifications/${notificationId}`);
};

// Delete all read notifications
export const clearReadNotifications = async (): Promise<number> => {
  const response = await api.delete<DeleteResponse>(
    "/api/notifications/clear-read",
  );
  return response.data.deletedCount;
};
