import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem.tsx";
import styles from "./NotificationDropdown.module.css";

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const { notifications, loading, markAllAsRead, clearReadNotifications } =
    useNotifications();

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

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notifications</h3>
        {notifications.length > 0 && (
          <button
            className={styles.markAllBtn}
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.content}>
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
            <p>No notifications</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className={styles.footer}>
          <button
            className={styles.clearBtn}
            onClick={handleClearRead}
            title="Clear all read notifications"
          >
            Clear read
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
