import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import * as authService from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import styles from "./UserProfileModal.module.css";

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal = ({ onClose }: ChangePasswordModalProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione password
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (!formData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    try {
      setLoading(true);

      await authService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Password updated successfully! Please login with your new password.");
      onClose();
      
      // Logout automatico dopo cambio password
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message;

      if ((error as { response?: { status?: number } }).response?.status === 401) {
        toast.error("Current password is incorrect");
      } else if ((error as { response?: { status?: number } }).response?.status === 400) {
        toast.error(errorMessage || "Invalid password provided");
      } else if ((error as { response?: { status?: number } }).response?.status === 404) {
        toast.error("User not found");
      } else {
        toast.error(errorMessage || "Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="change-password-title">Change Password</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close password modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">
              <FontAwesomeIcon icon={faLock} />
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">
              <FontAwesomeIcon icon={faLock} />
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              placeholder="Enter new password (min. 6 characters)"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">
              <FontAwesomeIcon icon={faLock} />
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
              required
            />
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
