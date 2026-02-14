export interface Notification {
  _id: string;
  message: string;
  type: "PROJECT_INVITE" | "TASK_CREATED" | "TASK_UPDATED" | "TASK_ASSIGNED" | "PROJECT_UPDATED";
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  sender: {
    _id: string;
    username: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  task?: {
    _id: string;
    title: string;
  };
}

export interface NotificationCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  modifiedCount: number;
}

export interface DeleteResponse {
  deletedCount: number;
}
