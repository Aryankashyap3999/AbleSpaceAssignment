import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Only check for user, since token is in HttpOnly cookie (not in state)
  if (!auth.user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
