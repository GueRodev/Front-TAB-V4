/**
 * Admin User Validation Schemas
 * Zod schemas for admin user form validation
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Roles: "admin" (Super Admin) | "moderador" (Moderador)
 * - Password requiere confirmación al crear
 */

import { z } from 'zod';

/**
 * Schema para crear nuevo usuario Admin/Moderador
 * Password es OBLIGATORIO y requiere confirmación
 */
export const createAdminSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),

  email: z.string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),

  password_confirmation: z.string()
    .min(8, 'La confirmación debe tener al menos 8 caracteres'),

  role: z.enum(['admin', 'moderador'], {
    errorMap: () => ({ message: 'Selecciona un rol válido (Super Admin o Moderador)' }),
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

/**
 * Schema para actualizar usuario Admin/Moderador
 * Password es OPCIONAL (solo si se desea cambiar)
 */
export const updateAdminSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .optional(),

  email: z.string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .optional(),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional(),

  password_confirmation: z.string()
    .min(8, 'La confirmación debe tener al menos 8 caracteres')
    .optional(),

  role: z.enum(['admin', 'moderador'], {
    errorMap: () => ({ message: 'Selecciona un rol válido (Super Admin o Moderador)' }),
  }).optional(),
}).refine((data) => {
  // Si se proporciona password, debe coincidir con password_confirmation
  if (data.password) {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;

// Mantener compatibilidad con código existente
export const adminSchema = createAdminSchema;
export type AdminFormData = CreateAdminFormData;
