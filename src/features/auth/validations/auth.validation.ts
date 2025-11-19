/**
 * Authentication Validation Schemas
 * Zod schemas for authentication data validation
 */

import { z } from 'zod';
import { FILE_UPLOAD_CONFIG } from '@/config';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

/**
 * Profile Update Schema
 */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(255, 'El correo electrónico es muy largo'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^\d{8,15}$/.test(val.replace(/\s/g, '')),
      'Ingresa un número de teléfono válido'
    ),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      'La contraseña debe tener al menos 8 caracteres'
    ),
  password_confirmation: z
    .string()
    .optional(),
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
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * Verification Code Schema
 */
export const verificationCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código solo debe contener números'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;
