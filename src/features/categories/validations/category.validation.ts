/**
 * Category and Subcategory Validation Schemas
 * Centralized validation rules using Zod
 */

import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  parent_id: z.string().nullable().optional(),
  level: z.number().min(0).max(3).default(0),
  order: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

export const subcategorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  categoryId: z.string().min(1, 'Debe seleccionar una categoría padre'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  level: z.number().min(1).max(3).default(1),
});

// Reorder validation for Laravel format
export const reorderSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    order: z.number().min(0),
  })),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type SubcategoryFormData = z.infer<typeof subcategorySchema>;
export type ReorderFormData = z.infer<typeof reorderSchema>;
