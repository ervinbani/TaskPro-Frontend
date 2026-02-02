import type { User } from "./user";

export interface Project {
  _id: string;
  name: string;
  description: string;
  tags?: string[]; // Array di tags
  owner: string | User; // Può essere un ID o l'oggetto User popolato
  collaborators: string[] | User[]; // Array di ID o oggetti User
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  tags?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  tags?: string[];
}
