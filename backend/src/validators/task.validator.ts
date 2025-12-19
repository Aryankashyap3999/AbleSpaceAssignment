import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['to_do', 'in_progress', 'review', 'completed']).optional().default('to_do'),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().min(1, 'Assignee ID is required')
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['to_do', 'in_progress', 'review', 'completed']).optional(),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().optional()
});

export const addCollaboratorSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

export const updateStatusSchema = z.object({
  status: z.enum(['to_do', 'in_progress', 'review', 'completed'])
});