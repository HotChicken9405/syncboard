import { z } from 'zod';

export const createTaskSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  assignee:    z.string().optional(),
  columnId:    z.string().min(1, 'Column is required'),
  dueDate:     z.string().optional().transform((val) => val ? new Date(val) : undefined),
  priority:    z.enum(['low', 'normal', 'high']).default('normal'),
  description: z.string().optional().default(''),
});

export const updateTaskSchema = z.object({
  title:       z.string().min(3).optional(),
  assignee:    z.string().optional(),
  columnId:    z.string().optional(),
  dueDate:     z.string().optional().transform((val) => val ? new Date(val) : undefined),
  priority:    z.enum(['low', 'normal', 'high']).optional(),
  description: z.string().optional(),
  version:     z.number().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});