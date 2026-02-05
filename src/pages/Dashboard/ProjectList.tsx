import { useNavigate } from "react-router-dom";
import type { Project } from "../../types/project";
import * as projectService from "../../services/projectService";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import styles from "./ProjectList.module.css";

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error: unknown) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success("Project deleted successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to delete project";
      toast.error(message || "Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>All Projects</h1>
        <p>Select a project from the sidebar or view all projects here</p>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <p>
            No projects yet. Create your first project using the + button in the
            sidebar!
          </p>
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <div key={project._id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <h3>{project.name}</h3>
                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className={styles.deleteBtn}
                  title="Delete project"
                >
                  ×
                </button>
              </div>
              <p className={styles.description}>
                {project.description || "No description"}
              </p>
              {project.tags && project.tags.length > 0 && (
                <div className={styles.tags}>
                  {project.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className={styles.cardFooter}>
                <button
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className={styles.viewBtn}
                >
                  View Tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
