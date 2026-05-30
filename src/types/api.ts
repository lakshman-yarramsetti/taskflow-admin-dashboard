export type Role = 'admin' | 'manager' | 'employee';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  managerId?: number | null;
  createdAt?: string;
};

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignedToId: number;
  assignedToName?: string | null;
  createdById: number;
  createdByName?: string | null;
  createdAt?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type LoginResponse = {
  user: User;
  accessToken: string;
};

export type TaskQuery = {
  status?: TaskStatus | '';
  search?: string;
  page?: number;
  limit?: number;
};
