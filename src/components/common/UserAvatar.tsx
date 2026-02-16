import React from "react";
import styles from "./UserAvatar.module.css";

interface UserAvatarProps {
  username?: string;
  email?: string;
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username = "User",
  email,
  size = "medium",
  showTooltip = true,
}) => {
  // Genera iniziali dal username (prime 2 lettere)
  const initials = (username || "U")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Genera colore basato sul username (per consistenza)
  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const backgroundColor = getColorFromString(username || "User");

  return (
    <div
      className={`${styles.avatar} ${styles[size]}`}
      style={{ backgroundColor }}
      title={showTooltip ? `${username}${email ? ` (${email})` : ""}` : ""}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
