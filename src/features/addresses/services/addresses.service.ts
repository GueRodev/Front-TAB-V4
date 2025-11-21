/**
 * Addresses Service
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * Handles address CRUD operations for authenticated clients
 */

import { api, API_ENDPOINTS } from '@/api';
import type { Address } from '../types';
import type { ApiResponse } from '@/api/types';

interface LaravelAddressResponse {
  addresses: Array<{
    id: number;
    user_id: number;
    label: string;
    province: string;
    canton: string;
    district: string;
    address_details: string; // Backend uses address_details instead of address
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

interface LaravelSingleAddressResponse {
  address: LaravelAddressResponse['addresses'][0];
  message?: string;
}

/**
 * Transform Laravel address to frontend Address type
 */
const transformLaravelAddress = (laravelAddress: LaravelAddressResponse['addresses'][0]): Address => {
  return {
    id: laravelAddress.id.toString(),
    user_id: laravelAddress.user_id.toString(),
    label: laravelAddress.label,
    province: laravelAddress.province,
    canton: laravelAddress.canton,
    district: laravelAddress.district,
    address: laravelAddress.address_details, // Map address_details to address
    is_default: laravelAddress.is_default,
    created_at: laravelAddress.created_at,
    updated_at: laravelAddress.updated_at,
  };
};

/**
 * Transform frontend Address to Laravel format
 */
const transformToLaravelAddress = (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): any => {
  return {
    label: address.label,
    province: address.province,
    canton: address.canton,
    district: address.district,
    address_details: address.address, // Map address to address_details
    is_default: address.is_default,
  };
};

export const addressesService = {
  /**
   * Get all addresses for authenticated client
   * ✅ Integrado con Laravel: GET /api/v1/addresses
   * Requires: Authorization header with Bearer token (role: Cliente)
   */
  async getMyAddresses(): Promise<ApiResponse<Address[]>> {
    try {
      const response = await api.get<LaravelAddressResponse>(API_ENDPOINTS.ADDRESSES);
      const addresses = response.data.addresses.map(transformLaravelAddress);

      return {
        data: addresses,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver direcciones.');
      }
      throw error;
    }
  },

  /**
   * Create new address
   * ✅ Integrado con Laravel: POST /api/v1/addresses
   * Requires: Authorization header with Bearer token (role: Cliente)
   */
  async create(data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Address>> {
    try {
      const laravelData = transformToLaravelAddress(data);
      const response = await api.post<LaravelSingleAddressResponse>(API_ENDPOINTS.ADDRESSES, laravelData);
      const address = transformLaravelAddress(response.data.address);

      return {
        data: address,
        message: response.data.message || 'Dirección creada exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const errors = error.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || 'Error de validación';
        throw new Error(firstError as string);
      }
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para crear direcciones.');
      }
      throw error;
    }
  },

  /**
   * Update existing address
   * ✅ Integrado con Laravel: PUT /api/v1/addresses/{id}
   * Requires: Authorization header with Bearer token (role: Cliente)
   */
  async update(id: string, data: Partial<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Address>> {
    try {
      // Transform to Laravel format (only include fields that are present)
      const laravelData: any = {};
      if (data.label !== undefined) laravelData.label = data.label;
      if (data.province !== undefined) laravelData.province = data.province;
      if (data.canton !== undefined) laravelData.canton = data.canton;
      if (data.district !== undefined) laravelData.district = data.district;
      if (data.address !== undefined) laravelData.address_details = data.address;
      if (data.is_default !== undefined) laravelData.is_default = data.is_default;

      const response = await api.put<LaravelSingleAddressResponse>(
        API_ENDPOINTS.ADDRESS_DETAIL(id),
        laravelData
      );
      const address = transformLaravelAddress(response.data.address);

      return {
        data: address,
        message: response.data.message || 'Dirección actualizada exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Dirección no encontrada');
      }
      if (error.response?.status === 422) {
        const errors = error.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || 'Error de validación';
        throw new Error(firstError as string);
      }
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para actualizar esta dirección.');
      }
      throw error;
    }
  },

  /**
   * Delete address
   * ✅ Integrado con Laravel: DELETE /api/v1/addresses/{id}
   * Requires: Authorization header with Bearer token (role: Cliente)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<{ message: string }>(API_ENDPOINTS.ADDRESS_DETAIL(id));

      return {
        data: undefined,
        message: response.data.message || 'Dirección eliminada exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Dirección no encontrada');
      }
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar esta dirección.');
      }
      throw error;
    }
  },

  /**
   * Set address as default
   * ✅ Integrado con Laravel: POST /api/v1/addresses/{id}/set-default
   * Requires: Authorization header with Bearer token (role: Cliente)
   */
  async setAsDefault(id: string): Promise<ApiResponse<Address>> {
    try {
      const response = await api.post<LaravelSingleAddressResponse>(
        API_ENDPOINTS.ADDRESS_SET_DEFAULT(id)
      );
      const address = transformLaravelAddress(response.data.address);

      return {
        data: address,
        message: response.data.message || 'Dirección predeterminada actualizada',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Dirección no encontrada');
      }
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para modificar esta dirección.');
      }
      throw error;
    }
  },

  /**
   * Admin: Get all addresses for a specific user
   * ✅ Integrado con Laravel: GET /api/v1/admin/users/{userId}/addresses
   * Requires: Authorization header with Bearer token (role: Super Admin)
   */
  async getUserAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    try {
      const response = await api.get<LaravelAddressResponse>(
        API_ENDPOINTS.ADMIN_USER_ADDRESSES(userId)
      );
      const addresses = response.data.addresses.map(transformLaravelAddress);

      return {
        data: addresses,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor inicia sesión.');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos de administrador para ver direcciones de usuarios.');
      }
      throw error;
    }
  },
};
