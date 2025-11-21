/**
 * Profile Service
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * Handles profile CRUD operations for all authenticated users (Admin, Moderador, Cliente)
 */

import { api, API_ENDPOINTS } from '@/api';
import type { ApiResponse } from '@/api/types';
import type { UserProfile } from '@/features/auth/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}

export interface LaravelProfileResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string; // "Super Admin", "Moderador", "Cliente"
    permissions?: string[];
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface LaravelProfileUpdateResponse {
  message: string;
  user: LaravelProfileResponse['user'];
}

/**
 * Transform Laravel user response to frontend UserProfile
 */
const transformLaravelProfile = (laravelUser: LaravelProfileResponse['user']): UserProfile => {
  // Map Laravel roles to frontend roles
  let role: 'admin' | 'moderador' | 'cliente' = 'cliente';
  if (laravelUser.role === 'Super Admin') {
    role = 'admin';
  } else if (laravelUser.role === 'Moderador') {
    role = 'moderador';
  }

  return {
    id: laravelUser.id.toString(),
    name: laravelUser.name,
    email: laravelUser.email,
    phone: laravelUser.phone || undefined,
    role,
    permissions: laravelUser.permissions || [],
    avatar: undefined, // Backend no tiene avatar aún
    email_verified_at: laravelUser.email_verified_at,
    created_at: laravelUser.created_at,
    updated_at: laravelUser.updated_at,
  };
};

export const profileService = {
  /**
   * Get current user profile
   * ✅ Integrado con Laravel: GET /api/v1/profile
   * @returns User profile with addresses
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.get<LaravelProfileResponse>(API_ENDPOINTS.PROFILE);
      const userProfile = transformLaravelProfile(response.data.user);

      return {
        data: userProfile,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      throw error;
    }
  },

  /**
   * Update current user profile
   * ✅ Integrado con Laravel: PUT /api/v1/profile
   * @param data - Profile data to update
   * @returns Updated user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    try {
      // Clean data: remove empty passwords
      const cleanData = { ...data };
      if (!cleanData.password || cleanData.password.trim() === '') {
        delete cleanData.password;
        delete cleanData.password_confirmation;
      }

      const response = await api.put<LaravelProfileUpdateResponse>(
        API_ENDPOINTS.PROFILE,
        cleanData
      );

      const userProfile = transformLaravelProfile(response.data.user);

      return {
        data: userProfile,
        message: response.data.message || 'Perfil actualizado exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const errors = error.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || 'Error de validación';
        throw new Error(firstError as string);
      }

      // Handle unauthorized (401)
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }

      throw error;
    }
  },

  /**
   * Upload avatar image
   * ⚠️ TODO: Implementar cuando el backend soporte avatars
   * Por ahora, solo crea preview local
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    console.warn('⚠️ uploadAvatar no implementado - pendiente módulo de perfil en backend');

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          data: { avatarUrl: reader.result as string },
          message: 'Avatar cargado localmente (pendiente backend)',
          timestamp: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    });
  },
};
