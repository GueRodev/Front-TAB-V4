/**
 * Addresses Service
 * Handles address CRUD operations for authenticated clients
 */

import { api } from '@/api';
import type { Address } from '../types';
import type { ApiResponse } from '@/api/types';

export const addressesService = {
  /**
   * Get all addresses for authenticated client
   * TODO: Connect to Laravel endpoint: GET /api/client/addresses
   * Requires: Authorization header with Bearer token
   */
  async getMyAddresses(): Promise<ApiResponse<Address[]>> {
    // TODO: Uncomment when Laravel is ready
    // return apiClient.get('/client/addresses');
    
    // Mock temporal desde localStorage
    const addresses = JSON.parse(localStorage.getItem('user_addresses') || '[]');
    return Promise.resolve({
      data: addresses,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Create new address
   * TODO: Connect to Laravel endpoint: POST /api/client/addresses
   * Requires: Authorization header with Bearer token
   */
  async create(data: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Address>> {
    // TODO: Uncomment when Laravel is ready
    // return apiClient.post('/client/addresses', data);
    
    const newAddress: Address = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const addresses = JSON.parse(localStorage.getItem('user_addresses') || '[]');
    addresses.push(newAddress);
    localStorage.setItem('user_addresses', JSON.stringify(addresses));
    
    return Promise.resolve({
      data: newAddress,
      message: 'Dirección creada exitosamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Update existing address
   * TODO: Connect to Laravel endpoint: PUT /api/client/addresses/{id}
   * Requires: Authorization header with Bearer token
   */
  async update(id: string, data: Partial<Address>): Promise<ApiResponse<Address>> {
    // TODO: Uncomment when Laravel is ready
    // return apiClient.put(`/client/addresses/${id}`, data);
    
    const addresses = JSON.parse(localStorage.getItem('user_addresses') || '[]');
    const index = addresses.findIndex((a: Address) => a.id === id);
    
    if (index === -1) {
      throw new Error('Dirección no encontrada');
    }
    
    addresses[index] = { 
      ...addresses[index], 
      ...data, 
      updated_at: new Date().toISOString() 
    };
    localStorage.setItem('user_addresses', JSON.stringify(addresses));
    
    return Promise.resolve({
      data: addresses[index],
      message: 'Dirección actualizada exitosamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Delete address
   * TODO: Connect to Laravel endpoint: DELETE /api/client/addresses/{id}
   * Requires: Authorization header with Bearer token
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    // TODO: Uncomment when Laravel is ready
    // return apiClient.delete(`/client/addresses/${id}`);
    
    const addresses = JSON.parse(localStorage.getItem('user_addresses') || '[]');
    const filtered = addresses.filter((a: Address) => a.id !== id);
    localStorage.setItem('user_addresses', JSON.stringify(filtered));
    
    return Promise.resolve({
      data: undefined,
      message: 'Dirección eliminada exitosamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Set address as default
   * TODO: Connect to Laravel endpoint: PATCH /api/client/addresses/{id}/default
   * Requires: Authorization header with Bearer token
   */
  async setAsDefault(id: string): Promise<ApiResponse<Address>> {
    // TODO: Uncomment when Laravel is ready
    // return apiClient.patch(`/client/addresses/${id}/default`);
    
    const addresses = JSON.parse(localStorage.getItem('user_addresses') || '[]');
    const updated = addresses.map((a: Address) => ({
      ...a,
      is_default: a.id === id,
      updated_at: new Date().toISOString(),
    }));
    
    localStorage.setItem('user_addresses', JSON.stringify(updated));
    const defaultAddress = updated.find((a: Address) => a.id === id);
    
    return Promise.resolve({
      data: defaultAddress,
      message: 'Dirección predeterminada actualizada',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Admin: Get all addresses for a specific user
   * TODO: Connect to Laravel endpoint: GET /api/admin/users/{userId}/addresses
   * Requires: Authorization header with Bearer token + admin role
   */
  async getUserAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    // TODO: Uncomment when Laravel is ready
    // return apiClient.get(`/admin/users/${userId}/addresses`);
    
    // Mock temporal
    return Promise.resolve({
      data: [],
      timestamp: new Date().toISOString(),
    });
  },
};
