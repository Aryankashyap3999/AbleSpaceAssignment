import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask as createTaskApi, updateTask as updateTaskApi, deleteTask as deleteTaskApi } from '@/apis/tasks';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  return useMutation({
    mutationFn: (data: Parameters<typeof createTaskApi>[0]) => createTaskApi(data, auth?.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assigned'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Parameters<typeof updateTaskApi>[1] }) =>
      updateTaskApi(taskId, data, auth?.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  return useMutation({
    mutationFn: (taskId: string) => deleteTaskApi(taskId, auth?.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
};
