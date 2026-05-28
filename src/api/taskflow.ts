import { api } from './client';
import type { ApiResponse, LoginResponse, Role, Task, TaskQuery, TaskStatus, User } from '../types/api';

export async function login(email: string, password: string) {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', payload);
  return response.data.data.user;
}

export async function fetchUsers() {
  const response = await api.get<ApiResponse<User[]>>('/users');
  return response.data.data;
}

export async function updateUserRole(userId: number, role: Role) {
  const response = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, {
    role,
  });
  return response.data.data;
}

export async function fetchTasks(query: TaskQuery = {}) {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== '' && value !== undefined),
  );

  const response = await api.get<ApiResponse<Task[]>>('/tasks', {
    params,
  });
  return response.data;
}

export async function createTask(payload: {
  title: string;
  description?: string;
  assignedToId: number;
}) {
  const response = await api.post<ApiResponse<Task>>('/tasks', payload);
  return response.data.data;
}

export async function updateTaskStatus(taskId: number, status: TaskStatus) {
  const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, {
    status,
  });
  return response.data.data;
}


