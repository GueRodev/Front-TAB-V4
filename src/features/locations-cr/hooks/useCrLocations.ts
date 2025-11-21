/**
 * useCrLocations Hook
 * ✅ Reusable hook for managing Costa Rica locations
 * Handles loading, caching, and hierarchical selection of locations
 */

import { useState, useEffect, useCallback } from 'react';
import { locationsService } from '../services';
import type { CrProvince, CrCanton, CrDistrict } from '../types';

interface UseCrLocationsReturn {
  // Data
  provinces: CrProvince[];
  cantones: CrCanton[];
  distritos: CrDistrict[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Selection handlers
  handleProvinceChange: (provinceName: string) => Promise<void>;
  handleCantonChange: (cantonName: string) => Promise<void>;

  // Utils
  loadLocations: () => Promise<void>;
  resetCantones: () => void;
  resetDistritos: () => void;
  resetAll: () => void;
}

export const useCrLocations = (): UseCrLocationsReturn => {
  const [provinces, setProvinces] = useState<CrProvince[]>([]);
  const [cantones, setCantones] = useState<CrCanton[]>([]);
  const [distritos, setDistritos] = useState<CrDistrict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current selections
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCanton, setSelectedCanton] = useState<string>('');

  /**
   * Load all provinces on mount
   */
  const loadLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provincesData = await locationsService.getProvinces();
      setProvinces(provincesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ubicaciones');
      console.error('Error loading locations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  /**
   * Handle province selection
   * Loads cantones for selected province
   */
  const handleProvinceChange = useCallback(async (provinceName: string) => {
    setSelectedProvince(provinceName);
    setSelectedCanton('');
    setCantones([]);
    setDistritos([]);

    if (!provinceName) return;

    try {
      const cantonesData = await locationsService.getCantones(provinceName);
      setCantones(cantonesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cantones');
      console.error('Error loading cantones:', err);
    }
  }, []);

  /**
   * Handle canton selection
   * Loads distritos for selected canton
   */
  const handleCantonChange = useCallback(async (cantonName: string) => {
    setSelectedCanton(cantonName);
    setDistritos([]);

    if (!cantonName || !selectedProvince) return;

    try {
      const distritosData = await locationsService.getDistritos(selectedProvince, cantonName);
      setDistritos(distritosData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar distritos');
      console.error('Error loading distritos:', err);
    }
  }, [selectedProvince]);

  /**
   * Reset cantones and distritos
   */
  const resetCantones = useCallback(() => {
    setCantones([]);
    setDistritos([]);
    setSelectedCanton('');
  }, []);

  /**
   * Reset distritos only
   */
  const resetDistritos = useCallback(() => {
    setDistritos([]);
  }, []);

  /**
   * Reset all selections
   */
  const resetAll = useCallback(() => {
    setSelectedProvince('');
    setSelectedCanton('');
    setCantones([]);
    setDistritos([]);
  }, []);

  return {
    provinces,
    cantones,
    distritos,
    isLoading,
    error,
    handleProvinceChange,
    handleCantonChange,
    loadLocations,
    resetCantones,
    resetDistritos,
    resetAll,
  };
};
