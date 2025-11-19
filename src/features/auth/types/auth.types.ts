/**
 * Authentication Types
 * Type definitions for authentication-related data
 */

import type { UserProfile } from './user.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  token_type?: string;
  expires_at: string;
}

/**
 * Laravel Authentication Response (Raw)
 * Estructura de respuesta del backend Laravel
 */
export interface LaravelAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      role: string;  // "Super Admin" | "Cliente"
      permissions: string[];
      email_verified_at?: string | null;
      created_at: string;
      updated_at?: string;
    };
    token: string;
    token_type: string;
  };
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
