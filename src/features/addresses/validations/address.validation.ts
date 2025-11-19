/**
 * Address Validation Schemas
 * Zod schemas for address data validation
 */

import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida'),
  province: z.string().min(1, 'La provincia es requerida'),
  canton: z.string().min(1, 'El cantón es requerido'),
  district: z.string().min(1, 'El distrito es requerido'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
