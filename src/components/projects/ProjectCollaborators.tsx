import { useState } from "react";
import { toast } from "react-toastify";
import type { Project } from "../../types/project";
import type { User } from "../../types/user";
import * as projectService from "../../services/projectService";
import styles from "./ProjectCollaborators.module.css";

interface ProjectCollaboratorsProps {
  project: Project;
  currentUserId: string;
  onUpdate: (updatedProject: Project) => void;
  onClose: () => void;
}

const ProjectCollaborators = ({
  project,
  currentUserId,
  onUpdate,
  onClose,
}: ProjectCollaboratorsProps) => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if current user is owner
  const isOwner =
    typeof project.owner === "string"
      ? project.owner === currentUserId
      : project.owner._id === currentUserId;

  // Get collaborators as User objects
  const collaborators = Array.isArray(project.collaborators)
    ? project.collaborators.filter((c): c is User => typeof c === "object")
    : [];

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error("Please enter an email or username");
      return;
    }

    if (!isOwner) {
      toast.error("Only the project owner can add collaborators");
      return;
    }

    try {
      setLoading(true);

      // Determine if it's an email or username
      const payload = identifier.includes("@")
        ? { email: identifier.trim() }
        : { username: identifier.trim() };

      const updatedProject = await projectService.addCollaborator(
        project._id,
        payload,
      );

      onUpdate(updatedProject);
      setIdentifier("");
      toast.success("Collaborator added successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to add collaborator",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!isOwner) {
      toast.error("Only the project owner can remove collaborators");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this collaborator?")) {
      return;
    }

    try {
      setLoading(true);
      const updatedProject = await projectService.removeCollaborator(
        project._id,
        userId,
      );

      onUpdate(updatedProject);
      toast.success("Collaborator removed successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to remove collaborator",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Project Collaborators</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Add collaborator form - only for owner */}
          {isOwner && (
            <form onSubmit={handleAddCollaborator} className={styles.addForm}>
              <div className={styles.formGroup}>
                <label htmlFor="identifier">Add Collaborator</label>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or username"
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add"}
                  </button>
                </div>
                <p className={styles.hint}>
                  Enter the email or username of the user you want to add
                </p>
              </div>
            </form>
          )}

          {/* Collaborators list */}
          <div className={styles.collaboratorsList}>
            <h3>
              Collaborators ({collaborators.length})
            </h3>

            {collaborators.length > 0 ? (
              <div className={styles.list}>
                {collaborators.map((collaborator) => (
                  <div key={collaborator._id} className={styles.collaboratorItem}>
                    <div className={styles.collaboratorInfo}>
                      <div className={styles.avatar}>
                        {collaborator.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.details}>
                        <p className={styles.username}>{collaborator.username}</p>
                        <p className={styles.email}>{collaborator.email}</p>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator._id)}
                        className={styles.removeBtn}
                        disabled={loading}
                        title="Remove collaborator"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noCollaborators}>
                No collaborators yet. {isOwner && "Add someone to get started!"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCollaborators;
