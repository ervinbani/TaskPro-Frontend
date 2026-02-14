import api from "./api";
import type { Task, CreateTaskDto, UpdateTaskDto, Todo } from "../types/task";

// Get all tasks for a project
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>(
    `/api/tasks/projects/${projectId}/tasks`,
  );
  return response.data;
};

// Create new task in a project
export const createTask = async (
  projectId: string,
  data: CreateTaskDto,
): Promise<Task> => {
  const response = await api.post<Task>(
    `/api/tasks/projects/${projectId}/tasks`,
    data,
  );
  return response.data;
};

// Update task
export const updateTask = async (
  taskId: string,
  data: UpdateTaskDto,
): Promise<Task> => {
  const response = await api.put<Task>(`/api/tasks/${taskId}`, data);
  return response.data;
};

// Delete task
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/api/tasks/${taskId}`);
};

// ======= TODO OPERATIONS =======

// Add todo to task
export const addTodo = async (taskId: string, text: string): Promise<Todo> => {
  const response = await api.post<Todo>(`/api/tasks/${taskId}/todos`, {
    text,
  });
  return response.data;
};

// Update todo (text or completed status)
export const updateTodo = async (
  taskId: string,
  todoId: string,
  updates: { text?: string; completed?: boolean },
): Promise<Todo> => {
  const response = await api.put<Todo>(
    `/api/tasks/${taskId}/todos/${todoId}`,
    updates,
  );
  return response.data;
};

// Delete todo
export const deleteTodo = async (
  taskId: string,
  todoId: string,
): Promise<void> => {
  await api.delete(`/api/tasks/${taskId}/todos/${todoId}`);
};
