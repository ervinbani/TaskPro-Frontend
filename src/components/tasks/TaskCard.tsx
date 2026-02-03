import type { Task, TaskPriority } from "../../types/task";
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
          {task.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
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

      {(task.comments && task.comments.length > 0) || task.priority ? (
        <div className={styles.cardFooter}>
          {task.comments && task.comments.length > 0 && (
            <div className={styles.commentsIndicator}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
              </svg>
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.priority && (
            <div className={`${styles.priorityBadge} ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TaskCard;
