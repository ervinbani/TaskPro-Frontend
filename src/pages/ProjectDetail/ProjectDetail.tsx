import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { Project } from "../../types/project";
import type { Task, TaskStatus, CreateTaskDto } from "../../types/task";
import * as projectService from "../../services/projectService";
import * as taskService from "../../services/taskService";
import TaskColumn from "../../components/tasks/TaskColumn";
import ProjectEditModal from "../../components/projects/ProjectEditModal";
import TaskComments from "../../components/tasks/TaskComments";
import styles from "./ProjectDetail.module.css";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All Tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  const [taskForm, setTaskForm] = useState<CreateTaskDto>({
    title: "",
    description: "",
    status: "To Do",
    tags: [],
    progress: 0,
    comments: [],
  });

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error: any) {
      toast.error("Failed to load project data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      status,
      tags: [],
      progress: 0,
      comments: [],
    });
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      tags: task.tags || [],
      progress: task.progress || 0,
      comments: task.comments || [],
    });
    setShowModal(true);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!projectId) return;

    try {
      if (editingTask) {
        const updated = await taskService.updateTask(editingTask._id, taskForm);
        setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
        toast.success("Task updated successfully!");
      } else {
        const created = await taskService.createTask(projectId, taskForm);
        setTasks([...tasks, created]);
        toast.success("Task created successfully!");
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "To Do",
      tags: [],
      progress: 0,
      comments: [],
    });
    setEditingTask(null);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleAddComment = (comment: string) => {
    const currentComments = taskForm.comments || [];
    setTaskForm({
      ...taskForm,
      comments: [...currentComments, comment],
    });
  };

  const handleEditComment = (index: number, newComment: string) => {
    const currentComments = taskForm.comments || [];
    const updatedComments = [...currentComments];
    updatedComments[index] = newComment;
    setTaskForm({
      ...taskForm,
      comments: updatedComments,
    });
  };

  const handleDeleteComment = (index: number) => {
    const currentComments = taskForm.comments || [];
    setTaskForm({
      ...taskForm,
      comments: currentComments.filter((_, i) => i !== index),
    });
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      // Check if search matches in title or description
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        (task.description?.toLowerCase().includes(searchLower) ?? false);

      // If "All Tasks" is selected, show all
      if (filterCategory === "All Tasks") {
        return matchesSearch;
      }

      // Check if the filter is a project tag
      const isProjectTag = project?.tags?.includes(filterCategory);

      if (isProjectTag) {
        // Filter by tag
        return task.tags?.includes(filterCategory) && matchesSearch;
      }

      return matchesSearch;
    });
  };

  const filteredTasks = getFilteredTasks();
  const todoTasks = filteredTasks.filter((t) => t.status === "To Do");
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "In Progress",
  );
  const doneTasks = filteredTasks.filter((t) => t.status === "Done");

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Project not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with search and actions */}
      <header className={styles.header}>
        <div className={styles.searchBar}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search for tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>
          <button className={styles.iconBtn}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </button>
          <button
            className={styles.editProjectBtn}
            onClick={() => setShowEditProjectModal(true)}
            title="Edit project"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Project info */}
      <div className={styles.projectInfo}>
        <div>
          <p className={styles.lastUpdated}>
            Last Updated:{" "}
            {project.updatedAt
              ? new Date(project.updatedAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recently"}
          </p>
          <h1 className={styles.projectTitle}>{project.name}</h1>
          {project.tags && project.tags.length > 0 && (
            <div className={styles.projectTags}>
              {project.tags.map((tag, index) => (
                <span key={index} className={styles.projectTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className={styles.filters}>
        <button
          onClick={() => setFilterCategory("All Tasks")}
          className={`${styles.filterBtn} ${
            filterCategory === "All Tasks" ? styles.activeFilter : ""
          }`}
        >
          All Tasks
        </button>
        {project.tags && project.tags.length > 0 && (
          <>
            <div className={styles.filterDivider}></div>
            {project.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterCategory(tag)}
                className={`${styles.filterBtn} ${styles.tagFilter} ${
                  filterCategory === tag ? styles.activeTagFilter : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </>
        )}{" "}
      </div>

      {/* Kanban Board */}
      <div className={styles.board}>
        <TaskColumn
          title="To Do"
          tasks={todoTasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
        <TaskColumn
          title="In Progress"
          tasks={inProgressTasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
        <TaskColumn
          title="Done"
          tasks={doneTasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => handleAddTask("To Do")}
        className={styles.floatingBtn}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>

      {/* Task Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value as TaskStatus,
                      })
                    }
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="progress">Progress: {taskForm.progress}%</label>
                <input
                  type="range"
                  id="progress"
                  min="0"
                  max="100"
                  step="10"
                  value={taskForm.progress}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      progress: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Tags</label>
                  <div className={styles.tagsSelector}>
                    {project.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = taskForm.tags || [];
                          if (currentTags.includes(tag)) {
                            setTaskForm({
                              ...taskForm,
                              tags: currentTags.filter((t) => t !== tag),
                            });
                          } else {
                            setTaskForm({
                              ...taskForm,
                              tags: [...currentTags, tag],
                            });
                          }
                        }}
                        className={`${styles.tagSelectorBtn} ${
                          taskForm.tags?.includes(tag)
                            ? styles.tagSelectorBtnActive
                            : ""
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editingTask && (
                <TaskComments
                  comments={taskForm.comments || []}
                  onAddComment={handleAddComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                />
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Edit Modal */}
      {showEditProjectModal && project && (
        <ProjectEditModal
          project={project}
          onClose={() => setShowEditProjectModal(false)}
          onUpdate={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
