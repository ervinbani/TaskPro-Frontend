import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faTasks,
  faEdit,
  faProjectDiagram,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "../../hooks/useNotifications";
import type { Notification } from "../../types/notification";
import styles from "./NotificationItem.module.css";

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  // Seleziona icona in base al tipo
  const getIcon = () => {
    switch (notification.type) {
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

  // Formatta data relativa (es. "2h ago")
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

  const handleClick = async () => {
    // Marca come letta se non lo è
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Naviga al progetto se disponibile
    if (notification.project?._id) {
      navigate(`/dashboard/projects/${notification.project._id}`);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Non triggerare il click della notifica

    try {
      await deleteNotification(notification._id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div
      className={`${styles.item} ${!notification.isRead ? styles.unread : ""}`}
      onClick={handleClick}
    >
      <div className={styles.iconWrapper}>
        <FontAwesomeIcon icon={getIcon()} className={styles.icon} />
      </div>

      <div className={styles.content}>
        <p className={styles.message}>{notification.message}</p>
        <div className={styles.meta}>
          {notification.sender && (
            <span className={styles.sender}>@{notification.sender.username}</span>
          )}
          <span className={styles.time}>
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      <button
        className={styles.deleteBtn}
        onClick={handleDelete}
        aria-label="Delete notification"
        title="Delete"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>

      {!notification.isRead && <div className={styles.unreadDot} />}
    </div>
  );
};

export default NotificationItem;
