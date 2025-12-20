import axiosInstance from '@/config/axiosConfig';
import type { AxiosError } from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface SearchUsersResponse {
  success: boolean;
  data: User[];
  message: string;
}

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    // Token is automatically sent in HttpOnly cookie via axios withCredentials
    const response = await axiosInstance.get<SearchUsersResponse>(`/v1/users/search?q=${query}`);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to search users');
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    // Token is automatically sent in HttpOnly cookie via axios withCredentials
    const response = await axiosInstance.get<{ success: boolean; data: User }>(`/v1/users/${userId}`);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch user');
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Token is automatically sent in HttpOnly cookie via axios withCredentials
    await axiosInstance.post('/v1/users/logout', {});
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to logout');
  }
};

export const getProfile = async (): Promise<User> => {
  try {
    // Token is automatically sent in HttpOnly cookie via axios withCredentials
    const response = await axiosInstance.get<{ success: boolean; data: User }>('/v1/users/profile');
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch profile');
  }
};

export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  try {
    // Token is automatically sent in HttpOnly cookie via axios withCredentials
    const response = await axiosInstance.put<{ success: boolean; data: User }>('/v1/users/profile', updates);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Failed to update profile');
  }
};

