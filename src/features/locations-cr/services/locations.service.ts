/**
 * Costa Rica Locations Service
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * Handles fetching and caching of Costa Rica geographical locations
 *
 * Estructura jerárquica: Provincia → Cantón → Distrito
 */

import { api, API_ENDPOINTS } from '@/api';
import type { CrProvince, CrCanton, CrDistrict, CrLocationsResponse } from '../types';

/**
 * In-memory cache for locations (persist during session)
 */
let cachedLocations: CrProvince[] | null = null;

export const locationsService = {
  /**
   * Get all Costa Rica locations (Provincias > Cantones > Distritos)
   * ✅ Integrado con Laravel: GET /api/v1/locations/cr
   *
   * Uses in-memory cache to avoid repeated API calls
   * Backend also caches for 24 hours
   */
  async getCrLocations(): Promise<CrProvince[]> {
    // Return cached data if available
    if (cachedLocations) {
      return cachedLocations;
    }

    try {
      const response = await api.get<CrLocationsResponse>(API_ENDPOINTS.LOCATIONS_CR);
      cachedLocations = response.data.provincias;
      return cachedLocations;
    } catch (error: any) {
      console.error('Error loading CR locations:', error);
      throw new Error('No se pudieron cargar las ubicaciones de Costa Rica');
    }
  },

  /**
   * Get provinces only (top level)
   */
  async getProvinces(): Promise<CrProvince[]> {
    const locations = await this.getCrLocations();
    return locations;
  },

  /**
   * Get cantones for a specific province
   */
  async getCantones(provinceName: string): Promise<CrCanton[]> {
    const locations = await this.getCrLocations();
    const province = locations.find(p => p.nombre === provinceName);
    return province?.cantones || [];
  },

  /**
   * Get distritos for a specific canton
   */
  async getDistritos(provinceName: string, cantonName: string): Promise<CrDistrict[]> {
    const cantones = await this.getCantones(provinceName);
    const canton = cantones.find(c => c.nombre === cantonName);
    return canton?.distritos || [];
  },

  /**
   * Validate if a location combination exists
   */
  async validateLocation(
    provinceName: string,
    cantonName: string,
    distritoName: string
  ): Promise<boolean> {
    try {
      const distritos = await this.getDistritos(provinceName, cantonName);
      return distritos.some(d => d.nombre === distritoName);
    } catch {
      return false;
    }
  },

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    cachedLocations = null;
  },
};
