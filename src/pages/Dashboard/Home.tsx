import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Project } from "../../types/project";
import * as projectService from "../../services/projectService";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Welcome to TaskPro{user ? `, ${user.username}` : ""}!</h1>
        <p>
          Manage your projects and tasks efficiently with our Kanban board
          system.
        </p>

        {loading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.length === 0 ? (
              <p className={styles.noProjects}>
                No projects yet. Create your first project to get started!
              </p>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  className={styles.projectCard}
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <h3>{project.name}</h3>
                  <p>{project.description || "No description"}</p>
                  {project.tags && project.tags.length > 0 && (
                    <div className={styles.tags}>
                      {project.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
