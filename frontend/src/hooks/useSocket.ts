import { useContext } from 'react';
import SocketContext from '@/context/SocketContext';
import type { SocketContextType } from '@/context/SocketContext';

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketContextProvider');
  }
  return context;
};
