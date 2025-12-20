import { type ReactNode } from 'react';

interface AuthProps {
  children: ReactNode;
}

export const Auth = ({ children }: AuthProps) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      {children}
    </div>
  );
};
