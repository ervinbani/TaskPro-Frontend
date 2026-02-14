import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationModal from "./NotificationModal";
import styles from "./NotificationBell.module.css";

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [showModal, setShowModal] = useState(false);

  const handleToggle = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <button
        className={styles.bellButton}
        onClick={handleToggle}
        aria-label="Notifications"
        title={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      >
        <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showModal && <NotificationModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default NotificationBell;
