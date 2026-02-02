import api from "./api";
import type { Project, CreateProjectDto, UpdateProjectDto } from "../types/project";

// Get all user's projects
export const getAllProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>("/projects");
  return response.data;
};

// Get single project by ID
export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
};

// Create new project
export const createProject = async (
  data: CreateProjectDto,
): Promise<Project> => {
  const response = await api.post<Project>("/projects", data);
  return response.data;
};

// Update project
export const updateProject = async (
  id: string,
  data: UpdateProjectDto,
): Promise<Project> => {
  const response = await api.put<Project>(`/projects/${id}`, data);
  return response.data;
};

// Delete project
export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
