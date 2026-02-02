import api from "./api";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from "../types/project";

// Get all user's projects
export const getAllProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>("/api/projects");
  return response.data;
};

// Get single project by ID
export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get<Project>(`/api/projects/${id}`);
  return response.data;
};

// Create new project
export const createProject = async (
  data: CreateProjectDto,
): Promise<Project> => {
  const response = await api.post<Project>("/api/projects", data);
  return response.data;
};

// Update project
export const updateProject = async (
  id: string,
  data: UpdateProjectDto,
): Promise<Project> => {
  const response = await api.put<Project>(`/api/projects/${id}`, data);
  return response.data;
};

// Delete project
export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};

// Add collaborator to project
export const addCollaborator = async (
  projectId: string,
  identifier: { email?: string; username?: string },
): Promise<Project> => {
  const response = await api.post<Project>(
    `/api/projects/${projectId}/collaborators`,
    identifier,
  );
  return response.data;
};

// Remove collaborator from project
export const removeCollaborator = async (
  projectId: string,
  userId: string,
): Promise<Project> => {
  const response = await api.delete<Project>(
    `/api/projects/${projectId}/collaborators/${userId}`,
  );
  return response.data;
};
