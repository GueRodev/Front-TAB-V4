/**
 * Address Types
 * Type definitions for address management
 */

export interface Address {
  id: string;
  user_id: string;
  label: string; // "Casa", "Trabajo", "Oficina"
  province: string;
  canton: string;
  district: string;
  address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
