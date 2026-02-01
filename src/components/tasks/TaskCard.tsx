import { Task } from "../../types/task";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Testing":
        return "#9ca3af";
      case "Development":
        return "#6b7280";
      case "Design":
        return "#a0a0a0";
      case "Planning":
        return "#8b8b8b";
      default:
        return "#9ca3af";
    }
  };

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

      {task.category && (
        <div className={styles.footer}>
          <span
            className={styles.categoryTag}
            style={{ backgroundColor: getCategoryColor(task.category) }}
          >
            {task.category}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
