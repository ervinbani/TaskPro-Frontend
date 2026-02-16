import React from "react";
import UserAvatar from "./UserAvatar";
import styles from "./UserAvatarGroup.module.css";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface UserAvatarGroupProps {
  users: User[];
  maxVisible?: number;
  size?: "small" | "medium" | "large";
  emptyText?: string;
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({
  users,
  maxVisible = 3,
  size = "small",
  emptyText = "Open to all",
}) => {
  if (!users || users.length === 0) {
    return <span className={styles.emptyText}>{emptyText}</span>;
  }

  // Filter out users with missing data
  const validUsers = users.filter((user) => user && user._id && user.username);

  if (validUsers.length === 0) {
    return <span className={styles.emptyText}>{emptyText}</span>;
  }

  const visibleUsers = validUsers.slice(0, maxVisible);
  const remainingCount = validUsers.length - maxVisible;

  return (
    <div className={styles.avatarGroup}>
      {visibleUsers.map((user) => (
        <div key={user._id} className={styles.avatarWrapper}>
          <UserAvatar username={user.username} email={user.email} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`${styles.avatarWrapper} ${styles.moreCount} ${styles[size]}`}
          title={`+${remainingCount} more: ${validUsers
            .slice(maxVisible)
            .map((u) => u.username)
            .join(", ")}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default UserAvatarGroup;
