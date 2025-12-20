import { useQuery } from '@tanstack/react-query';
import { getCreatedTasks, getAssignedTasks } from '@/apis/tasks';
import { useAuth } from '@/hooks/useAuth';
import type { Task } from '@/apis/tasks';

export const useCreatedTasks = () => {
  const { auth } = useAuth();

  return useQuery<Task[], Error>({
    queryKey: ['tasks', 'created'],
    queryFn: () => getCreatedTasks(auth?.token),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAssignedTasks = () => {
  const { auth } = useAuth();

  return useQuery<Task[], Error>({
    queryKey: ['tasks', 'assigned'],
    queryFn: () => getAssignedTasks(auth?.token),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
