/**
 * Product Validation Schemas
 * Zod schemas for product-related form validation
 * Updated for Laravel backend compatibility
 */

import { z } from 'zod';

/**
 * Product creation/update schema
 */
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  
  brand: z.string()
    .max(100, 'La marca no puede exceder 100 caracteres')
    .nullable()
    .optional(),
  
  category_id: z.string()
    .min(1, 'Selecciona una categoría'),
  
  sku: z.string()
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .nullable()
    .optional(),
  
  price: z.number()
    .min(0, 'El precio debe ser positivo')
    .max(99999999.99, 'El precio excede el máximo permitido'),
  
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  
  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .nullable()
    .optional(),
  
  image: z.instanceof(File).optional(),
  
  status: z.enum(['active', 'inactive', 'out_of_stock'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  
  is_featured: z.boolean().default(false),
});

/**
 * Stock adjustment schema
 */
export const adjustStockSchema = z.object({
  type: z.enum(['entrada', 'salida', 'ajuste']),
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser mayor a 0'),
  reason: z.string()
    .max(255, 'La razón no puede exceder 255 caracteres')
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type AdjustStockFormData = z.infer<typeof adjustStockSchema>;
