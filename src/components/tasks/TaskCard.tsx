import type { Task, TaskPriority } from "../../types/task";
import UserAvatarGroup from "../common/UserAvatarGroup";
import { getTagColor } from "../../utils/tagColors";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const getPriorityClass = (priority?: TaskPriority) => {
  if (!priority) return "";
  switch (priority) {
    case "High":
      return styles.priorityHigh;
    case "Medium":
      return styles.priorityMedium;
    case "Low":
      return styles.priorityLow;
    default:
      return "";
  }
};

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <div className={styles.card} onClick={() => onEdit?.(task)}>
      <div className={styles.cardHeader}>
        <h4 className={styles.title}>{task.title}</h4>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className={styles.deleteBtn}
            title="Delete task"
          >
            ×
          </button>
        )}
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className={styles.tags}>
          {task.tags.map((tag, index) => {
            const tagColors = getTagColor(tag);
            const tagStyle = {
              backgroundColor: isDarkMode ? tagColors.bgDark : tagColors.bg,
              color: isDarkMode ? tagColors.colorDark : tagColors.color,
            };
            return (
              <span key={index} className={styles.tag} style={tagStyle}>
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className={styles.assignedSection}>
          <span className={styles.assignedLabel}>Assigned to:</span>
          <UserAvatarGroup
            users={task.assignedTo}
            maxVisible={3}
            size="small"
          />
        </div>
      )}

      {task.progress !== undefined && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className={styles.progressText}>{task.progress}%</span>
        </div>
      )}

      {(task.comments && task.comments.length > 0) ||
      task.priority ||
      task.dueDate ||
      (task.todos && task.todos.length > 0) ? (
        <div className={styles.cardFooter}>
          {task.comments && task.comments.length > 0 && (
            <div className={styles.commentsIndicator}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
              </svg>
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.todos && task.todos.length > 0 && (
            <div className={styles.todosIndicator}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z" />
              </svg>
              <span>
                {task.todos.filter((t) => t.completed).length}/
                {task.todos.length}
              </span>
            </div>
          )}
          {task.dueDate && (
            <div className={styles.dueDateIndicator}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
              </svg>
              <span>
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {task.priority && (
            <div
              className={`${styles.priorityBadge} ${getPriorityClass(task.priority)}`}
            >
              {task.priority}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TaskCard;
