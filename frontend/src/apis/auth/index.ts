interface SignUpData {
  email: string;
  password: string;
  name: string;
  username: string;
}

interface SignInData {
  email: string;
  password: string;
}

export interface AuthApiResponse {
  data: {
    _id: string;
    email: string;
    name: string;
    username: string;
  };
  token?: string;
  success: boolean;
  message: string;
}

import axios from '@/config/axiosConfig';

export const signUpRequest = async (data: SignUpData): Promise<AuthApiResponse> => {
  try {
    const response = await axios.post('/v1/users/signup', data);
    return response?.data;
  } catch (error) {
    console.log('Error at signup api:', error);
    throw error;
  }
};

export const signInRequest = async (data: SignInData): Promise<AuthApiResponse> => {
  try {
    const response = await axios.post('/v1/users/signin', data);
    return response?.data;
  } catch (error) {
    console.log('Error at signin api:', error);
    throw error;
  }
};

