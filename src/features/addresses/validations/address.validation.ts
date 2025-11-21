/**
 * Address Validation Schemas
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * Zod schemas for address data validation matching backend requirements
 */

import { z } from 'zod';

/**
 * Address validation schema
 * Matches backend StoreAddressRequest validation rules
 */
export const addressSchema = z.object({
  label: z.string()
    .min(1, 'La etiqueta es requerida')
    .max(50, 'La etiqueta no debe exceder 50 caracteres')
    .refine(
      (val) => ['Casa', 'Trabajo', 'Otro'].includes(val),
      'La etiqueta debe ser: Casa, Trabajo u Otro'
    ),

  province: z.string()
    .min(1, 'La provincia es requerida')
    .max(100, 'La provincia no debe exceder 100 caracteres'),

  canton: z.string()
    .min(1, 'El cantón es requerido')
    .max(100, 'El cantón no debe exceder 100 caracteres'),

  district: z.string()
    .min(1, 'El distrito es requerido')
    .max(100, 'El distrito no debe exceder 100 caracteres'),

  address: z.string()
    .min(10, 'Las señas exactas deben tener al menos 10 caracteres')
    .max(500, 'Las señas exactas no deben exceder 500 caracteres'),

  is_default: z.boolean().optional(),
});

/**
 * Update address schema (all fields optional)
 */
export const updateAddressSchema = z.object({
  label: z.string()
    .max(50, 'La etiqueta no debe exceder 50 caracteres')
    .refine(
      (val) => ['Casa', 'Trabajo', 'Otro'].includes(val),
      'La etiqueta debe ser: Casa, Trabajo u Otro'
    )
    .optional(),

  province: z.string()
    .max(100, 'La provincia no debe exceder 100 caracteres')
    .optional(),

  canton: z.string()
    .max(100, 'El cantón no debe exceder 100 caracteres')
    .optional(),

  district: z.string()
    .max(100, 'El distrito no debe exceder 100 caracteres')
    .optional(),

  address: z.string()
    .min(10, 'Las señas exactas deben tener al menos 10 caracteres')
    .max(500, 'Las señas exactas no deben exceder 500 caracteres')
    .optional(),

  is_default: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type UpdateAddressFormData = z.infer<typeof updateAddressSchema>;
