export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: string; // ID del progetto
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
