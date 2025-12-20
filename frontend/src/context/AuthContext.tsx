import { createContext, type ReactNode, useEffect, useState } from 'react';
import { logout as logoutApi } from '@/apis/users';

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  logout: () => Promise<void>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [auth, setAuth] = useState({
    user: null as User | null,
    token: null as string | null,
    isLoading: true,
  });

  useEffect(() => {
    const user = localStorage.getItem('user');

    // Token is now in HttpOnly cookie, not in localStorage
    if (user) {
      setAuth({
        user: JSON.parse(user),
        token: null, // Token is in HttpOnly cookie, managed by backend
        isLoading: false,
      });
    } else {
      setAuth({
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, []);

  async function logout() {
    try {
      // Call backend logout endpoint to clear HttpOnly cookie
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      setAuth({
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
