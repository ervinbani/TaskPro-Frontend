import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faTasks,
  faEdit,
  faProjectDiagram,
  faTrash,
  faCheck,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "../../hooks/useNotifications";
import type { Notification } from "../../types/notification";
import styles from "./NotificationModal.module.css";

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal = ({ onClose }: NotificationModalProps) => {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    fetchNotifications,
  } = useNotifications();

  const navigate = useNavigate();

  // Fetch notifications when modal opens
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "PROJECT_INVITE":
        return faUserPlus;
      case "TASK_CREATED":
        return faTasks;
      case "TASK_UPDATED":
      case "TASK_ASSIGNED":
        return faEdit;
      case "PROJECT_UPDATED":
        return faProjectDiagram;
      default:
        return faTasks;
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Navigate to project if available
    if (notification.project?._id) {
      navigate(`/dashboard/projects/${notification.project._id}`);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} new</span>
            )}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Action buttons */}
        {notifications.length > 0 && (
          <div className={styles.actions}>
            {unreadCount > 0 && (
              <button
                className={styles.actionBtn}
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>Mark all read</span>
              </button>
            )}
            {readCount > 0 && (
              <button
                className={styles.actionBtn}
                onClick={handleClearRead}
                title="Clear read notifications"
              >
                <FontAwesomeIcon icon={faBroom} />
                <span>Clear read</span>
              </button>
            )}
          </div>
        )}

        <div className={styles.modalBody}>
          {loading && notifications.length === 0 ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <svg
                className={styles.emptyIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`${styles.notificationItem} ${
                    !notification.isRead ? styles.unread : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles.iconWrapper}>
                    <FontAwesomeIcon
                      icon={getIcon(notification.type)}
                      className={styles.icon}
                    />
                  </div>

                  <div className={styles.content}>
                    <p className={styles.message}>{notification.message}</p>
                    <div className={styles.meta}>
                      {notification.sender && (
                        <span className={styles.sender}>
                          @{notification.sender.username}
                        </span>
                      )}
                      <span className={styles.time}>
                        {getRelativeTime(notification.createdAt)}
                      </span>
                      {notification.project && (
                        <span className={styles.project}>
                          📁 {notification.project.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, notification._id)}
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  {!notification.isRead && <div className={styles.unreadDot} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
