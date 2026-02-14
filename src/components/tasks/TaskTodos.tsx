import { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { Todo } from "../../types/task";
import * as taskService from "../../services/taskService";
import styles from "./TaskTodos.module.css";

interface TaskTodosProps {
  taskId: string;
  todos: Todo[];
  todoProgress?: number;
  onUpdate: (updatedTodos: Todo[], updatedProgress?: number) => void;
}

const TaskTodos = ({
  taskId,
  todos,
  todoProgress,
  onUpdate,
}: TaskTodosProps) => {
  const [newTodoText, setNewTodoText] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingTodoId, setProcessingTodoId] = useState<string | null>(null);

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) {
      toast.error("Todo text cannot be empty");
      return;
    }

    if (newTodoText.length > 200) {
      toast.error("Todo text cannot exceed 200 characters");
      return;
    }

    try {
      setLoading(true);
      const newTodo = await taskService.addTodo(taskId, newTodoText.trim());
      const updatedTodos = [...todos, newTodo];
      const progress = calculateProgress(updatedTodos);
      onUpdate(updatedTodos, progress);
      setNewTodoText("");
      toast.success("Todo added successfully");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add todo");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      setProcessingTodoId(todo._id);
      const updatedTodo = await taskService.updateTodo(taskId, todo._id, {
        completed: !todo.completed,
      });
      const updatedTodos = todos.map((t) =>
        t._id === todo._id ? updatedTodo : t,
      );
      const progress = calculateProgress(updatedTodos);
      onUpdate(updatedTodos, progress);
      toast.success(
        updatedTodo.completed ? "Todo completed! ✓" : "Todo marked as incomplete",
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast.error("Failed to update todo");
    } finally {
      setProcessingTodoId(null);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    try {
      setProcessingTodoId(todoId);
      await taskService.deleteTodo(taskId, todoId);
      const updatedTodos = todos.filter((t) => t._id !== todoId);
      const progress = calculateProgress(updatedTodos);
      onUpdate(updatedTodos, progress);
      toast.success("Todo deleted successfully");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo");
    } finally {
      setProcessingTodoId(null);
    }
  };

  const calculateProgress = (todoList: Todo[]): number => {
    if (todoList.length === 0) return 0;
    const completed = todoList.filter((t) => t.completed).length;
    return Math.round((completed / todoList.length) * 100);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className={styles.todosContainer}>
      <div className={styles.todosHeader}>
        <h3>Todo List</h3>
        <span className={styles.todosCount}>
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${todoProgress || 0}%` }}
            />
          </div>
          <span className={styles.progressText}>{todoProgress || 0}%</span>
        </div>
      )}

      {/* Add New Todo Form */}
      <div className={styles.addTodoForm}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
          maxLength={200}
          disabled={loading}
          className={styles.todoInput}
        />
        <button
          type="button"
          onClick={handleAddTodo}
          disabled={loading || !newTodoText.trim()}
          className={styles.addTodoBtn}
          title="Add todo"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* Todos List */}
      <div className={styles.todosList}>
        {todos.length === 0 ? (
          <p className={styles.emptyState}>
            No todos yet. Add your first todo above!
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className={`${styles.todoItem} ${todo.completed ? styles.completed : ""}`}
            >
              <button
                type="button"
                onClick={() => handleToggleTodo(todo)}
                disabled={processingTodoId === todo._id}
                className={styles.todoCheckbox}
                aria-label={
                  todo.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                {todo.completed && <FontAwesomeIcon icon={faCheck} />}
              </button>

              <div className={styles.todoContent}>
                <span className={styles.todoText}>{todo.text}</span>
                {todo.completed && todo.completedBy && (
                  <span className={styles.todoMeta}>
                    Completed by {todo.completedBy.username}
                    {todo.completedAt &&
                      ` on ${new Date(todo.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteTodo(todo._id)}
                disabled={processingTodoId === todo._id}
                className={styles.deleteTodoBtn}
                aria-label="Delete todo"
                title="Delete todo"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskTodos;
