import api from "./api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import { setToken, setUser, getUser, clearAuth } from "../utils/storage";

// Register new user
export const register = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/user/register", credentials);

  // Salva token e user in localStorage
  setToken(response.data.token);
  setUser(response.data.user);

  return response.data;
};

// Login user
export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/user/login", credentials);

  // Salva token e user in localStorage
  setToken(response.data.token);
  setUser(response.data.user);

  return response.data;
};

// Logout user
export const logout = (): void => {
  clearAuth();
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  return getUser();
};
