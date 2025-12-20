import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { signUpRequest, type AuthApiResponse } from '@/apis/auth';
import type { AxiosError } from 'node_modules/axios/index.d.cts';

interface SignUpData {
  email: string;
  password: string;
  name: string;
  username: string;
}

export const useSignUp = (): UseMutationResult<
  AuthApiResponse,
  AxiosError<{ message: string }>,
  SignUpData,
  unknown
> => {
  return useMutation({
    mutationFn: signUpRequest,
    onSuccess: (data) => {
      console.log('Sign up successfully: ', data);
      toast.success('Successfully signed up');
    },
    onError: (error) => {
      console.log('Failed to signup ', error);
      toast.error(error?.response?.data?.message || 'Error, signup failed');
    },
  });
};

