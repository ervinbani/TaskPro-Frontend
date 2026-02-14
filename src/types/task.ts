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

export interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: {
    _id: string;
    username: string;
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
  dueDate?: string | null; // Data di scadenza opzionale (ISO format)
  comments?: TaskComment[]; // Array di commenti
  todos?: Todo[]; // Array di todos
  todoProgress?: number; // Percentuale completamento todos (0-100)
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
  dueDate?: string | null;
  comments?: TaskComment[];
  todos?: Todo[];
  todoProgress?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string | null;
  comments?: TaskComment[];
  progress?: number;
  todos?: Todo[];
  todoProgress?: number;
}
