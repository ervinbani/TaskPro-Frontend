import api from "./api";
import type { Task, CreateTaskDto, UpdateTaskDto } from "../types/task";

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
