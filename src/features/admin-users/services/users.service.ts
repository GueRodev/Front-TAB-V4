/**
 * Users Service
 * API service for user management operations (Super Admin only)
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Gestión de usuarios Admin y Moderador
 * - Solo Super Admin puede crear/editar/eliminar usuarios
 * - Los clientes se registran ellos mismos (no se gestionan aquí)
 */

import { api, API_ENDPOINTS } from "@/api";
import type { AdminProfile } from '@/features/auth';
import type { ApiResponse } from '@/api/types';
import { transformLaravelUser, mapFrontendRoleToLaravel } from '@/features/auth/utils/transformers';

/**
 * Estructura de respuesta de Laravel para usuarios
 */
interface LaravelUserResponse {
  success: boolean;
  message?: string;
  data: {
    user?: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      role: string; // "Super Admin" | "Moderador"
      permissions: string[];
      email_verified_at?: string | null;
      created_at: string;
      updated_at?: string;
    };
    users?: Array<{
      id: number;
      name: string;
      email: string;
      phone?: string;
      role: string;
      permissions: string[];
      email_verified_at?: string | null;
      created_at: string;
      updated_at?: string;
    }>;
  };
}

export const usersService = {
  /**
   * Listar todos los usuarios Admin y Moderador
   * ✅ Integrado con Laravel: GET /api/v1/users
   *
   * Solo muestra usuarios con rol "Super Admin" o "Moderador"
   * NO muestra usuarios con rol "Cliente" (se registran públicamente)
   */
  async getAdmins(): Promise<ApiResponse<AdminProfile[]>> {
    try {
      const response = await api.get<LaravelUserResponse>(API_ENDPOINTS.USERS);
      const laravelResponse = response.data;

      // Transformar usuarios de Laravel a formato frontend
      const users = (laravelResponse.data.users || []).map(user =>
        transformLaravelUser(user) as AdminProfile
      );

      return {
        data: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener un usuario específico por ID
   * ✅ Integrado con Laravel: GET /api/v1/users/{id}
   */
  async getUserById(userId: string): Promise<ApiResponse<AdminProfile>> {
    try {
      const response = await api.get<LaravelUserResponse>(API_ENDPOINTS.USER_DETAIL(userId));
      const laravelResponse = response.data;

      if (!laravelResponse.data.user) {
        throw new Error('Usuario no encontrado');
      }

      const user = transformLaravelUser(laravelResponse.data.user) as AdminProfile;

      return {
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear nuevo usuario Admin o Moderador
   * ✅ Integrado con Laravel: POST /api/v1/users
   *
   * VALIDACIONES BACKEND:
   * - Solo Super Admin puede crear usuarios
   * - Solo puede crear roles "Super Admin" o "Moderador"
   * - Email debe ser único
   * - Password requiere confirmación
   */
  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'moderador';
  }): Promise<ApiResponse<AdminProfile>> {
    try {
      // Mapear rol del frontend a Laravel
      const laravelRole = mapFrontendRoleToLaravel(data.role);

      const response = await api.post<LaravelUserResponse>(API_ENDPOINTS.USERS, {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: laravelRole,
      });

      const laravelResponse = response.data;

      if (!laravelResponse.data.user) {
        throw new Error('Error al crear usuario');
      }

      const user = transformLaravelUser(laravelResponse.data.user) as AdminProfile;

      return {
        data: user,
        message: laravelResponse.message || 'Usuario creado exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || "Error de validación";
        throw new Error(firstError as string);
      }
      throw error;
    }
  },

  /**
   * Actualizar usuario existente
   * ✅ Integrado con Laravel: PUT /api/v1/users/{id}
   *
   * VALIDACIONES BACKEND:
   * - Solo Super Admin puede actualizar usuarios
   * - No puede cambiar su propio rol
   * - No puede cambiar el rol del último Super Admin
   * - Password es opcional (solo si se desea cambiar)
   */
  async updateAdmin(userId: string, data: {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    role?: 'admin' | 'moderador';
  }): Promise<ApiResponse<AdminProfile>> {
    try {
      // Preparar datos para enviar
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.password) {
        updateData.password = data.password;
        updateData.password_confirmation = data.password_confirmation;
      }
      if (data.role) {
        updateData.role = mapFrontendRoleToLaravel(data.role);
      }

      const response = await api.put<LaravelUserResponse>(
        API_ENDPOINTS.USER_DETAIL(userId),
        updateData
      );

      const laravelResponse = response.data;

      if (!laravelResponse.data.user) {
        throw new Error('Error al actualizar usuario');
      }

      const user = transformLaravelUser(laravelResponse.data.user) as AdminProfile;

      return {
        data: user,
        message: laravelResponse.message || 'Usuario actualizado exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || "Error de validación";
        throw new Error(firstError as string);
      }
      if (error.response?.status === 403) {
        throw new Error(error.response.data.message || 'No tienes permisos para realizar esta acción');
      }
      throw error;
    }
  },

  /**
   * Eliminar usuario
   * ✅ Integrado con Laravel: DELETE /api/v1/users/{id}
   *
   * VALIDACIONES BACKEND:
   * - Solo Super Admin puede eliminar usuarios
   * - No puede eliminarse a sí mismo
   * - No puede eliminar el último Super Admin del sistema
   */
  async deleteAdmin(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<LaravelUserResponse>(
        API_ENDPOINTS.USER_DETAIL(userId)
      );

      const laravelResponse = response.data;

      return {
        data: undefined,
        message: laravelResponse.message || 'Usuario eliminado exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(error.response.data.message || 'No tienes permisos para realizar esta acción');
      }
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw error;
    }
  },

  /**
   * Obtener todos los clientes con sus direcciones
   * ✅ Integrado con Laravel: GET /api/v1/users/clients
   *
   * Obtiene todos los usuarios con rol Cliente
   * Incluye dirección por defecto y conteo de órdenes
   */
  async getClients(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          clients: Array<{
            id: number;
            name: string;
            email: string;
            phone?: string | null;
            role: string;
            created_at: string;
            email_verified_at?: string | null;
            orders_count: number;
            default_address?: {
              id: number;
              province: string;
              canton: string;
              district: string;
              address_details: string;
              label: string;
            } | null;
          }>;
        };
      }>(API_ENDPOINTS.USERS_CLIENTS);

      const laravelClients = response.data.data.clients;

      // Transformar datos de Laravel a formato frontend
      const clients = laravelClients.map((client) => ({
        id: client.id,
        nombre: client.name,
        email: client.email,
        telefono: client.phone || 'N/A',
        activo: true, // Por defecto activo (puede ser mejorado con un campo en BD)
        fechaRegistro: new Date(client.created_at).toISOString().split('T')[0],
        ordenes: client.orders_count,
        direccion: client.default_address
          ? {
              provincia: client.default_address.province,
              canton: client.default_address.canton,
              distrito: client.default_address.district,
              direccion: client.default_address.address_details,
            }
          : {
              provincia: 'N/A',
              canton: 'N/A',
              distrito: 'N/A',
              direccion: 'Sin dirección registrada',
            },
      }));

      return {
        data: clients,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  },
};
