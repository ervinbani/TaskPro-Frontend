export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface TaskComment {
  description: string;
  owner: {
    username: string;
    email: string;
  };
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority; // Priorità del task
  tags?: string[]; // Tags scelti dai tags del progetto
  progress?: number; // 0-100
  comments?: TaskComment[]; // Array di commenti
  project: string; // ID del progetto
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  progress?: number;
  comments?: TaskComment[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  comments?: TaskComment[];
  progress?: number;
}
