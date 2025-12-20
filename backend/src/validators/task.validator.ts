import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']).optional().default('todo'),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']).optional(),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().optional()
});

export const addCollaboratorSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

export const updateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'completed'])
});