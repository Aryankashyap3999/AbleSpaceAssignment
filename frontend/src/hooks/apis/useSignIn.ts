import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { signInRequest, type AuthApiResponse } from '@/apis/auth';
import { useAuth } from '@/hooks/useAuth';
import type { AxiosError } from 'axios';

interface SignInData {
  email: string;
  password: string;
}

export const useSignIn = (): UseMutationResult<
  AuthApiResponse,
  AxiosError<{ message: string }>,
  SignInData,
  unknown
> => {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: signInRequest,
    onSuccess: (response) => {
      console.log('Sign in successful, response:', response);
      toast.success('Successfully signed in');

      // Store only user data in localStorage, token is in HttpOnly cookie
      localStorage.setItem('user', JSON.stringify(response.data));

      setAuth({
        user: response.data,
        token: null, // Token is now in HttpOnly cookie, not in state
        isLoading: false,
      });
    },
    onError: (error) => {
      console.log('Sign in error:', error);
      toast.error(error.response?.data?.message || 'Error, signin failed');
    },
  });
};

