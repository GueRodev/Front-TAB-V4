/**
 * Admin User Validation Schemas
 * Zod schemas for admin user form validation
 */

import { z } from 'zod';

/**
 * Admin creation/update schema
 */
export const adminSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional(),
  
  role: z.enum(['admin', 'moderador'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
});

export type AdminFormData = z.infer<typeof adminSchema>;
