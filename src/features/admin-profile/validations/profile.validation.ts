/**
 * Profile Validation Schemas
 * ✅ Unified validation for Admin, Moderador, and Cliente profiles
 * Zod schemas for profile form validation
 */

import { z } from 'zod';

/**
 * Base profile schema (shared fields for all user types)
 */
const baseProfileSchema = {
  name: z.string()
    .trim()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  email: z.string()
    .trim()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(255, 'El correo electrónico es muy largo'),

  password: z.string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      'La contraseña debe tener al menos 8 caracteres'
    ),

  password_confirmation: z.string()
    .optional(),
};

/**
 * Profile schema with phone (for Cliente users)
 */
export const profileSchemaWithPhone = z.object({
  ...baseProfileSchema,
  phone: z.string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^\d{8,15}$/.test(val.replace(/\s/g, '')),
      'Ingresa un número de teléfono válido'
    ),
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

/**
 * Profile schema without phone (for Admin/Moderador users)
 */
export const profileSchema = z.object({
  ...baseProfileSchema,
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

/**
 * Legacy alias for backward compatibility
 * @deprecated Use profileSchema instead
 */
export const adminProfileSchema = profileSchema;

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ProfileFormDataWithPhone = z.infer<typeof profileSchemaWithPhone>;

/**
 * Legacy alias for backward compatibility
 * @deprecated Use ProfileFormData instead
 */
export type AdminProfileFormData = ProfileFormData;
