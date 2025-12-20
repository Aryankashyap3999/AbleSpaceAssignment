import axiosInstance from '@/config/axiosConfig';
import type { AxiosError } from 'axios';

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  dueDate: string;
  createdById: string;
  assignedToId?: string;
  collaborators: string[];
  lastModifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTasksResponse {
  success: boolean;
  data: Task[];
  message: string;
}

export const getCreatedTasks = async (token?: string | null): Promise<Task[]> => {
  try {
    const response = await axiosInstance.get<GetTasksResponse>('/v1/tasks/user', {
      headers: token ? { 'x-access-token': token } : {},
    });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch created tasks');
  }
};

export const getAssignedTasks = async (token?: string | null): Promise<Task[]> => {
  try {
    const response = await axiosInstance.get<GetTasksResponse>('/v1/tasks/assigned', {
      headers: token ? { 'x-access-token': token } : {},
    });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch assigned tasks');
  }
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: Task }>(`/v1/tasks/${taskId}`);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch task');
  }
};

export const createTask = async (
  taskData: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    status?: string;
    assignedToId?: string;
  },
  token?: string | null
): Promise<Task> => {
  try {
    const response = await axiosInstance.post<{ success: boolean; data: Task }>('/v1/tasks/create', taskData, {
      headers: token ? { 'x-access-token': token } : {},
    });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to create task');
  }
};

export const updateTask = async (
  taskId: string,
  taskData: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
    assignedToId?: string;
  },
  token?: string | null
): Promise<Task> => {
  try {
    const response = await axiosInstance.put<{ success: boolean; data: Task }>(`/v1/tasks/${taskId}`, taskData, {
      headers: token ? { 'x-access-token': token } : {},
    });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to update task');
  }
};

export const deleteTask = async (taskId: string, token?: string | null): Promise<void> => {
  try {
    await axiosInstance.delete(`/v1/tasks/${taskId}`, {
      headers: token ? { 'x-access-token': token } : {},
    });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to delete task');
  }
};
