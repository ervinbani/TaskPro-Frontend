import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faBell,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { Project } from "../../types/project";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskDto,
  TaskComment,
  Todo,
} from "../../types/task";
import * as projectService from "../../services/projectService";
import * as taskService from "../../services/taskService";
import TaskColumn from "../../components/tasks/TaskColumn";
import ProjectEditModal from "../../components/projects/ProjectEditModal";
import ProjectCollaborators from "../../components/projects/ProjectCollaborators";
import TaskComments from "../../components/tasks/TaskComments";
import TaskTodos from "../../components/tasks/TaskTodos";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import { getTagColor } from "../../utils/tagColors";
import styles from "./ProjectDetail.module.css";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All Tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);

  const [taskForm, setTaskForm] = useState<CreateTaskDto>({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    tags: [],
    progress: 0,
    dueDate: null,
    comments: [],
    todos: [],
    todoProgress: 0,
    assignedTo: [],
  });

  const loadProjectData = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
      ]);

      // Popola assignedTo nei todos se sono solo ID
      if (tasksData.length > 0 && projectData) {
        // Crea una mappa di tutti i membri del progetto
        const membersMap = new Map();
        if (typeof projectData.owner === "object") {
          membersMap.set(projectData.owner._id, projectData.owner);
        }
        if (Array.isArray(projectData.collaborators)) {
          projectData.collaborators.forEach((collab) => {
            if (typeof collab === "object") {
              membersMap.set(collab._id, collab);
            }
          });
        }

        // Popola assignedTo in tutti i todos
        const populatedTasks = tasksData.map((task) => {
          if (task.todos && task.todos.length > 0) {
            const populatedTodos = task.todos.map((todo) => {
              if (
                todo.assignedTo &&
                typeof todo.assignedTo === "string" &&
                membersMap.has(todo.assignedTo)
              ) {
                const user = membersMap.get(todo.assignedTo);
                return {
                  ...todo,
                  assignedTo: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                  },
                };
              }
              return todo;
            });
            return { ...task, todos: populatedTodos };
          }
          return task;
        });

        setProject(projectData);
        setTasks(populatedTasks);
      } else {
        setProject(projectData);
        setTasks(tasksData);
      }
    } catch (error: unknown) {
      toast.error("Failed to load project data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId, loadProjectData]);

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showModal) setShowModal(false);
        if (showEditProjectModal) setShowEditProjectModal(false);
        if (showCollaboratorsModal) setShowCollaboratorsModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal, showEditProjectModal, showCollaboratorsModal]);

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      status,
      priority: "Medium",
      tags: [],
      progress: 0,
      dueDate: null,
      comments: [],
      assignedTo: [],
    });
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);

    // Popola i dati assignedTo dei todos se sono solo ID
    let populatedTodos = task.todos || [];
    if (populatedTodos.length > 0 && project) {
      // Crea una mappa di tutti i membri del progetto
      const membersMap = new Map();
      if (typeof project.owner === "object") {
        membersMap.set(project.owner._id, project.owner);
      }
      if (Array.isArray(project.collaborators)) {
        project.collaborators.forEach((collab) => {
          if (typeof collab === "object") {
            membersMap.set(collab._id, collab);
          }
        });
      }

      // Popola assignedTo se è solo un ID
      populatedTodos = populatedTodos.map((todo) => {
        if (
          todo.assignedTo &&
          typeof todo.assignedTo === "string" &&
          membersMap.has(todo.assignedTo)
        ) {
          const user = membersMap.get(todo.assignedTo);
          return {
            ...todo,
            assignedTo: {
              _id: user._id,
              username: user.username,
              email: user.email,
            },
          };
        }
        return todo;
      });
    }

    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority || "Medium",
      tags: task.tags || [],
      progress: task.progress || 0,
      dueDate: task.dueDate || null,
      comments: task.comments || [],
      todos: populatedTodos,
      todoProgress: task.todoProgress || 0,
      assignedTo: task.assignedTo?.map((u) => u._id) || [],
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
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to save task";
      toast.error(message);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !user) return;

    // Check if user is the owner
    const ownerId =
      typeof project.owner === "string" ? project.owner : project.owner._id;
    if (ownerId !== user._id) {
      toast.error("You are not the owner. You cannot delete this project.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this project? All tasks will be permanently deleted.",
      )
    ) {
      return;
    }

    if (!projectId) return;

    try {
      await projectService.deleteProject(projectId);
      toast.success("Project deleted successfully!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to delete project";
      toast.error(message);
    }
  };

  const handleEditProject = () => {
    if (!project || !user) return;

    // Check if user is the owner
    const ownerId =
      typeof project.owner === "string" ? project.owner : project.owner._id;
    if (ownerId !== user._id) {
      toast.error("You are not the owner. You cannot modify this project.");
      return;
    }

    setShowEditProjectModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to delete task";
      toast.error(message);
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      tags: [],
      progress: 0,
      dueDate: null,
      comments: [],
      todos: [],
      todoProgress: 0,
      assignedTo: [],
    });
    setEditingTask(null);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleAddComment = (comment: string) => {
    if (!user) {
      toast.error("You must be logged in to add comments");
      return;
    }

    const newComment: TaskComment = {
      description: comment,
      owner: {
        username: user.username,
        email: user.email,
      },
      createdAt: new Date().toISOString(),
    };

    const currentComments = taskForm.comments || [];
    setTaskForm({
      ...taskForm,
      comments: [...currentComments, newComment],
    });
  };

  const handleEditComment = (index: number, newComment: string) => {
    const currentComments = taskForm.comments || [];
    const updatedComments = [...currentComments];
    updatedComments[index] = {
      ...updatedComments[index],
      description: newComment,
    };
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

  const handleUpdateTodos = (
    updatedTodos: Todo[],
    updatedProgress?: number,
  ) => {
    setTaskForm({
      ...taskForm,
      todos: updatedTodos,
      todoProgress: updatedProgress,
    });
    // Update also the tasks array if editing
    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t._id === editingTask._id
            ? { ...t, todos: updatedTodos, todoProgress: updatedProgress }
            : t,
        ),
      );
    }
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
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
          />
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowCollaboratorsModal(true)}
            title="Manage collaborators"
          >
            <FontAwesomeIcon icon={faUserGroup} />
          </button>
          <button
            className={styles.iconBtn}
            aria-label="Notifications"
            title="Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
          </button>

          <button
            className={styles.editProjectBtn}
            onClick={handleEditProject}
            title="Edit project"
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>

          <button
            className={styles.deleteProjectBtn}
            onClick={handleDeleteProject}
            title="Delete project"
          >
            <FontAwesomeIcon icon={faTrash} />
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
            {project.tags.map((tag) => {
              const isActive = filterCategory === tag;
              const tagColors = getTagColor(tag);
              const tagStyle = isActive
                ? {
                    backgroundColor: isDarkMode
                      ? tagColors.bgDark
                      : tagColors.bg,
                    color: isDarkMode ? tagColors.colorDark : tagColors.color,
                    borderColor: "transparent",
                  }
                : {};

              return (
                <button
                  key={tag}
                  onClick={() => setFilterCategory(tag)}
                  className={`${styles.filterBtn} ${styles.tagFilter} ${
                    isActive ? styles.activeTagFilter : ""
                  }`}
                  style={tagStyle}
                >
                  {tag}
                </button>
              );
            })}
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

                <div className={styles.formGroup}>
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={taskForm.priority || "Medium"}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.dueDateHeader}>
                    <label htmlFor="dueDate">Due Date</label>
                    {taskForm.dueDate && (
                      <button
                        type="button"
                        onClick={() =>
                          setTaskForm({ ...taskForm, dueDate: null })
                        }
                        className={styles.removeDateBtn}
                        title="Remove due date"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    value={
                      taskForm.dueDate
                        ? new Date(taskForm.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        dueDate: e.target.value || null,
                      })
                    }
                  />
                </div>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Tags</label>
                  <div className={styles.tagsSelector}>
                    {project.tags.map((tag) => {
                      const isActive = taskForm.tags?.includes(tag);
                      const tagColors = getTagColor(tag);
                      const tagStyle = isActive
                        ? {
                            backgroundColor: isDarkMode
                              ? tagColors.bgDark
                              : tagColors.bg,
                            color: isDarkMode
                              ? tagColors.colorDark
                              : tagColors.color,
                          }
                        : {};

                      return (
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
                            isActive ? styles.tagSelectorBtnActive : ""
                          }`}
                          style={tagStyle}
                        >
                          {tag}
                          {isActive && (
                            <span className={styles.removeTagIcon}>×</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assign Task To */}
              <div className={styles.formGroup}>
                <label>Assign Task To (Optional)</label>
                <p className={styles.fieldHelper}>
                  Leave empty to allow all members to work on this task
                </p>
                <div className={styles.assignSelector}>
                  {(() => {
                    const members = [];
                    // Add owner
                    if (typeof project.owner === "object") {
                      members.push({
                        _id: project.owner._id,
                        username: project.owner.username,
                        email: project.owner.email,
                        label: `${project.owner.username} (Owner)`,
                      });
                    }
                    // Add collaborators
                    if (Array.isArray(project.collaborators)) {
                      project.collaborators.forEach((collab) => {
                        if (typeof collab === "object") {
                          members.push({
                            _id: collab._id,
                            username: collab.username,
                            email: collab.email,
                            label: collab.username,
                          });
                        }
                      });
                    }
                    return members.map((member) => (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => {
                          const currentAssigned = taskForm.assignedTo || [];
                          if (currentAssigned.includes(member._id)) {
                            setTaskForm({
                              ...taskForm,
                              assignedTo: currentAssigned.filter(
                                (id) => id !== member._id,
                              ),
                            });
                          } else {
                            setTaskForm({
                              ...taskForm,
                              assignedTo: [...currentAssigned, member._id],
                            });
                          }
                        }}
                        className={`${styles.assignBtn} ${
                          taskForm.assignedTo?.includes(member._id)
                            ? styles.assignBtnActive
                            : ""
                        }`}
                        title={member.email}
                      >
                        {member.label}
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {editingTask && (
                <>
                  <TaskTodos
                    taskId={editingTask._id}
                    todos={taskForm.todos || []}
                    todoProgress={taskForm.todoProgress}
                    onUpdate={handleUpdateTodos}
                    taskAssignedUsers={editingTask.assignedTo || []}
                    projectMembers={(() => {
                      const members = [];
                      if (typeof project.owner === "object") {
                        members.push(project.owner);
                      }
                      if (Array.isArray(project.collaborators)) {
                        project.collaborators.forEach((collab) => {
                          if (typeof collab === "object") {
                            members.push(collab);
                          }
                        });
                      }
                      return members;
                    })()}
                  />
                  <TaskComments
                    comments={taskForm.comments || []}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                  />
                </>
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

      {/* Collaborators Modal */}
      {showCollaboratorsModal && project && user && (
        <ProjectCollaborators
          project={project}
          currentUserId={user._id}
          onUpdate={handleUpdateProject}
          onClose={() => setShowCollaboratorsModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
