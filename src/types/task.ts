export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskCategory =
  | "Testing"
  | "Development"
  | "Design"
  | "Planning"
  | "Other";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category?: TaskCategory;
  progress?: number; // 0-100
  project: string; // ID del progetto
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  progress?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  progress?: number;
}
