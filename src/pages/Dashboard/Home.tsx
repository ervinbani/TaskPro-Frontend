import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Project } from "../../types/project";
import { Task } from "../../types/task";
import * as projectService from "../../services/projectService";
import * as taskService from "../../services/taskService";
import styles from "./Home.module.css";

interface ProjectWithStats extends Project {
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    todoPercentage: number;
    inProgressPercentage: number;
    donePercentage: number;
  };
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectsWithStats();
  }, []);

  const fetchProjectsWithStats = async () => {
    try {
      const projectsData = await projectService.getAllProjects();

      const projectsWithStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasks = await taskService.getProjectTasks(project._id);
            const total = tasks.length;
            const todo = tasks.filter((t) => t.status === "To Do").length;
            const inProgress = tasks.filter(
              (t) => t.status === "In Progress",
            ).length;
            const done = tasks.filter((t) => t.status === "Done").length;

            return {
              ...project,
              taskStats: {
                total,
                todo,
                inProgress,
                done,
                todoPercentage:
                  total > 0 ? Math.round((todo / total) * 100) : 0,
                inProgressPercentage:
                  total > 0 ? Math.round((inProgress / total) * 100) : 0,
                donePercentage:
                  total > 0 ? Math.round((done / total) * 100) : 0,
              },
            };
          } catch (error) {
            return {
              ...project,
              taskStats: {
                total: 0,
                todo: 0,
                inProgress: 0,
                done: 0,
                todoPercentage: 0,
                inProgressPercentage: 0,
                donePercentage: 0,
              },
            };
          }
        }),
      );

      setProjects(projectsWithStats);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Welcome back{user ? `, ${user.username}` : ""}! 👋
          </h1>
          <p className={styles.subtitle}>
            Manage your projects and tasks efficiently with our Kanban board
            system.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading your projects...</p>
          </div>
        ) : (
          <>
            <div className={styles.sectionHeader}>
              <h2>Your Projects</h2>
              <span className={styles.projectCount}>
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <div className={styles.projectsGrid}>
              {projects.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.emptyIcon}
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <h3>No projects yet</h3>
                  <p>Create your first project to get started!</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project._id}
                    className={styles.projectCard}
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div className={styles.cardHeader}>
                      <h3>{project.name}</h3>
                      <div className={styles.cardIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </div>
                    </div>
                    <p className={styles.cardDescription}>
                      {project.description || "No description"}
                    </p>

                    {/* Task Statistics */}
                    <div className={styles.stats}>
                      <div className={styles.statItem}>
                        <span className={styles.statNumber}>
                          {project.taskStats.total}
                        </span>
                        <span className={styles.statLabel}>Total Tasks</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statNumber}>
                          {project.taskStats.donePercentage}%
                        </span>
                        <span className={styles.statLabel}>Completed</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {project.taskStats.total > 0 && (
                      <div className={styles.progressSection}>
                        <div className={styles.progressBar}>
                          <div
                            className={`${styles.progressSegment} ${styles.progressDone}`}
                            style={{
                              width: `${project.taskStats.donePercentage}%`,
                            }}
                          />
                          <div
                            className={`${styles.progressSegment} ${styles.progressInProgress}`}
                            style={{
                              width: `${project.taskStats.inProgressPercentage}%`,
                            }}
                          />
                          <div
                            className={`${styles.progressSegment} ${styles.progressTodo}`}
                            style={{
                              width: `${project.taskStats.todoPercentage}%`,
                            }}
                          />
                        </div>
                        <div className={styles.progressLegend}>
                          <div className={styles.legendItem}>
                            <span
                              className={`${styles.legendDot} ${styles.legendDotDone}`}
                            ></span>
                            <span className={styles.legendText}>
                              Done ({project.taskStats.done})
                            </span>
                          </div>
                          <div className={styles.legendItem}>
                            <span
                              className={`${styles.legendDot} ${styles.legendDotInProgress}`}
                            ></span>
                            <span className={styles.legendText}>
                              In Progress ({project.taskStats.inProgress})
                            </span>
                          </div>
                          <div className={styles.legendItem}>
                            <span
                              className={`${styles.legendDot} ${styles.legendDotTodo}`}
                            ></span>
                            <span className={styles.legendText}>
                              To Do ({project.taskStats.todo})
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

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
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
