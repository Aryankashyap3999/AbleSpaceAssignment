import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { TASK_EVENTS, NOTIFICATION_EVENTS } from '@/utils/socketEvents';
import { useAuth } from '@/hooks/useAuth';
import type { Task } from '@/apis/tasks';

export interface Notification {
  id: string;
  type: string;
  message: string;
  task: Task;
  timestamp: Date;
  read: boolean;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: SocketContextProviderProps) => {
  const { auth } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!auth?.user) return;

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Store user ID in a variable to avoid null check issues in cleanup
    const userId = auth.user._id;

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);

      // Join task room with user ID
      newSocket.emit(TASK_EVENTS.JOIN_TASK_ROOM, { userId });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Task update events
    newSocket.on(TASK_EVENTS.TASK_CREATED, (taskData) => {
      console.log('Task created:', taskData);
    });

    newSocket.on(TASK_EVENTS.TASK_UPDATED, (taskData) => {
      console.log('Task updated:', taskData);
    });

    newSocket.on(TASK_EVENTS.TASK_DELETED, (taskData) => {
      console.log('Task deleted:', taskData);
    });

    newSocket.on(TASK_EVENTS.TASK_STATUS_CHANGED, (taskData) => {
      console.log('Task status changed:', taskData);
    });

    // Assignment notification
    newSocket.on(NOTIFICATION_EVENTS.ASSIGNMENT_NOTIFICATION, (notification) => {
      console.log('New assignment notification:', notification);
      const newNotification: Notification = {
        id: `${Date.now()}`,
        type: notification.type,
        message: notification.message,
        task: notification.task,
        timestamp: new Date(notification.timestamp),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    });

    // Use Promise microtask to defer socket state update
    Promise.resolve().then(() => {
      setSocket(newSocket);
    });

    return () => {
      newSocket.emit(TASK_EVENTS.LEAVE_TASK_ROOM, { userId });
      newSocket.disconnect();
    };
  }, [auth?.user]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
