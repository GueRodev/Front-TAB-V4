/**
 * Admin Profile Validation Schemas
 * Zod schemas for admin profile form validation
 */

import { z } from 'zod';

/**
 * Admin profile update schema
 */
export const adminProfileSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  
  password_confirmation: z.string()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.password && data.password.length > 0) {
      return data.password === data.password_confirmation;
    }
    return true;
  },
  {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  }
);

export type AdminProfileFormData = z.infer<typeof adminProfileSchema>;
