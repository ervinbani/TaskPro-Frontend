import { useState, useEffect, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Project } from "../../types/project";
import * as projectService from "../../services/projectService";
import { toast } from "react-toastify";
import Sidebar from "../../components/layout/Sidebar";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });

  // Carica i progetti
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      setNewProject({ name: "", description: "" });
      toast.success("Project created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar projects={projects} onCreateProject={() => setShowModal(true)} />
      
      <main className={styles.content}>
        <Outlet />
      </main>

      {/* Modal for creating project */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
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
