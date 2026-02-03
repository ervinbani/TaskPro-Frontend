import { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
import type { User } from "../../types/user";
import * as authService from "../../services/authService";
import ChangePasswordModal from "./ChangePasswordModal";
import styles from "./UserProfileModal.module.css";

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const UserProfileModal = ({
  user,
  onClose,
  onUpdate,
}: UserProfileModalProps) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione username
    if (formData.username && formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    // Validazione email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Invalid email format");
      return;
    }

    // Controlla se profilo è stato modificato
    const profileChanged =
      formData.username !== user.username || formData.email !== user.email;

    if (!profileChanged) {
      toast.info("No changes to save");
      return;
    }

    try {
      setLoading(true);

      const updateData: { username?: string; email?: string } = {};
      if (formData.username !== user.username) {
        updateData.username = formData.username;
      }
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }

      const updatedUser = await authService.updateProfile(updateData);
      onUpdate(updatedUser);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;

      if (error.response?.status === 400) {
        toast.error(errorMessage || "Invalid data provided");
      } else if (error.response?.status === 404) {
        toast.error("User not found");
      } else {
        toast.error(errorMessage || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>User Profile</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <p className={styles.userEmail}>{user.email}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">
              <FontAwesomeIcon icon={faUser} />
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.passwordSection}>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className={styles.changePasswordBtn}
            >
              <FontAwesomeIcon icon={faKey} />
              Change Password
            </button>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default UserProfileModal;
