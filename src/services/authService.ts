import api from "./api";
import type {
  AuthResponse,
  BackendAuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import { setToken, setUser, getUser, clearAuth } from "../utils/storage";

// Register new user
export const register = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<BackendAuthResponse>(
    "/api/user/register",
    credentials,
  );

  // Valida la risposta
  if (!response.data.token || !response.data._id || !response.data.email) {
    throw new Error("Invalid response from server");
  }

  // Trasforma la risposta del backend nel formato atteso
  const user: User = {
    _id: response.data._id,
    username: response.data.username,
    email: response.data.email,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };

  setToken(response.data.token);
  setUser(user);

  return {
    token: response.data.token,
    user,
  };
};

// Login user
export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<BackendAuthResponse>(
    "/api/user/login",
    credentials,
  );

  // Valida la risposta
  if (!response.data.token || !response.data._id || !response.data.email) {
    throw new Error("Invalid response from server");
  }

  // Trasforma la risposta del backend nel formato atteso
  const user: User = {
    _id: response.data._id,
    username: response.data.username,
    email: response.data.email,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
  };

  setToken(response.data.token);
  setUser(user);

  return {
    token: response.data.token,
    user,
  };
};

// Logout user
export const logout = (): void => {
  clearAuth();
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  return getUser();
};

// Update user profile (username and/or email)
export const updateProfile = async (data: {
  username?: string;
  email?: string;
}): Promise<User> => {
  // Validazioni frontend
  if (data.username && data.username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error("Invalid email format");
  }

  const response = await api.put<User>("/api/user/profile", data);

  // Update user in localStorage
  setUser(response.data);

  return response.data;
};

// Update user password
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  // Validazione frontend
  if (data.newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  if (!data.currentPassword) {
    throw new Error("Current password is required");
  }

  const response = await api.put<{ message: string }>(
    "/api/user/update-password",
    data,
  );

  return response.data;
};
