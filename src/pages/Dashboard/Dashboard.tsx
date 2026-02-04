import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import type { Project } from "../../types/project";
import * as projectService from "../../services/projectService";
import { toast } from "react-toastify";
import Sidebar from "../../components/layout/Sidebar";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const loadProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error: unknown) {
      toast.error("Failed to load projects");
      console.error(error);
    }
  };

  // Carica i progetti
  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const created = await projectService.createProject(newProject);
      setProjects([...projects, created]);
      setShowModal(false);
      setNewProject({ name: "", description: "", tags: [] });
      setTagInput("");
      toast.success("Project created successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message 
        : "Failed to create project";
      toast.error(message);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !newProject.tags.includes(tag)) {
        setNewProject({ ...newProject, tags: [...newProject.tags, tag] });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewProject({
      ...newProject,
      tags: newProject.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Hamburger Button */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        projects={projects}
        onCreateProject={() => setShowModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={styles.content}>
        <Outlet />
      </main>

      {/* Modal for creating project */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProject} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
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
                {newProject.tags.length > 0 && (
                  <div className={styles.tagsList}>
                    {newProject.tags.map((tag) => (
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
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
