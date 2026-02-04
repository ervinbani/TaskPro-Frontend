import { useState } from "react";
import type { Project, UpdateProjectDto } from "../../types/project";
import * as projectService from "../../services/projectService";
import { toast } from "react-toastify";
import styles from "./ProjectEditModal.module.css";

interface ProjectEditModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

const ProjectEditModal = ({
  project,
  onClose,
  onUpdate,
}: ProjectEditModalProps) => {
  const [formData, setFormData] = useState<UpdateProjectDto>({
    name: project.name,
    description: project.description,
    tags: project.tags || [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const updated = await projectService.updateProject(project._id, formData);
      onUpdate(updated);
      toast.success("Project updated successfully!");
      onClose();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message
        : undefined;
      toast.error(errorMessage || "Failed to update project");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData({ ...formData, tags: [...(formData.tags || []), tag] });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Project</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (Press Enter to add)</label>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add a tag and press Enter"
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className={styles.tagsList}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.tagRemove}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditModal;
