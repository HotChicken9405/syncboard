import { z } from 'zod';

export const createColumnSchema = z.object({
  name:  z.string().min(1, 'Column name is required'),
  color: z.string().optional().default('#111111'),
});

export const updateColumnSchema = z.object({
  name:     z.string().min(1).optional(),
  color:    z.string().optional(),
  position: z.number().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const reorderColumnsSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});