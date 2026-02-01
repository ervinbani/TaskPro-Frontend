import { Task, TaskStatus } from "../../types/task";
import TaskCard from "./TaskCard";
import styles from "./TaskColumn.module.css";

interface TaskColumnProps {
  title: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskColumn = ({
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) => {
  return (
    <div className={styles.column}>
      <h3 className={styles.columnTitle}>{title}</h3>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
        <button onClick={() => onAddTask(title)} className={styles.addTaskBtn}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
};

export default TaskColumn;
