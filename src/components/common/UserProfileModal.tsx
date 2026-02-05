import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faKey,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: Are you sure you want to delete your account?\n\n" +
        "This action will permanently delete:\n" +
        "• Your account and profile\n" +
        "• All projects you own\n" +
        "• All your tasks and comments\n" +
        "• You will be removed from all shared projects\n\n" +
        "This action cannot be undone!",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await authService.deleteAccount();
      toast.success(
        "Account deleted successfully. All your projects and tasks have been removed.",
      );
      onClose();
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: unknown) {
      const isAxiosError = error instanceof Error && "response" in error;
      const response =
        isAxiosError && typeof error.response === "object"
          ? error.response
          : null;
      const errorData =
        response &&
        response !== null &&
        "data" in response &&
        typeof response.data === "object"
          ? response.data
          : null;
      const status =
        response && response !== null && "status" in response
          ? response.status
          : null;
      const errorMessage =
        (errorData && errorData !== null && "message" in errorData
          ? String(errorData.message)
          : null) || (error instanceof Error ? error.message : null);

      if (status === 400) {
        toast.error(errorMessage || "Invalid data provided");
      } else if (status === 404) {
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
            <button
              type="button"
              onClick={handleDeleteAccount}
              className={styles.deleteAccountBtn}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete Account
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
