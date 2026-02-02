export type TaskStatus = "To Do" | "In Progress" | "Done";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  tags?: string[]; // Tags scelti dai tags del progetto
  progress?: number; // 0-100
  comments?: string[]; // Array di commenti
  project: string; // ID del progetto
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  tags?: string[];
  progress?: number;
  comments?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  tags?: string[];
  comments?: string[];
  progress?: number;
}
