/**
 * LocationSelector Component
 * ✅ Reusable component for selecting Costa Rica locations
 * Displays hierarchical dropdowns: Provincia → Cantón → Distrito
 *
 * Can be used in:
 * - Address forms
 * - Shipping forms
 * - Any location selection scenario
 */

import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrLocations } from '../hooks';
import { Loader2 } from 'lucide-react';

export interface LocationSelectorProps {
  /**
   * Current values (controlled)
   */
  province?: string;
  canton?: string;
  district?: string;

  /**
   * Change handlers
   */
  onProvinceChange: (value: string) => void;
  onCantonChange: (value: string) => void;
  onDistrictChange: (value: string) => void;

  /**
   * Validation errors
   */
  errors?: {
    province?: string;
    canton?: string;
    district?: string;
  };

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Show labels
   */
  showLabels?: boolean;

  /**
   * Required fields indicator
   */
  required?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  province = '',
  canton = '',
  district = '',
  onProvinceChange,
  onCantonChange,
  onDistrictChange,
  errors = {},
  disabled = false,
  showLabels = true,
  required = true,
}) => {
  const {
    provinces,
    cantones,
    distritos,
    isLoading,
    error,
    handleProvinceChange,
    handleCantonChange,
  } = useCrLocations();

  /**
   * When province changes externally, load cantones
   */
  useEffect(() => {
    if (province && provinces.length > 0) {
      handleProvinceChange(province);
    }
  }, [province, provinces.length]);

  /**
   * When canton changes externally, load distritos
   */
  useEffect(() => {
    if (canton && province) {
      handleCantonChange(canton);
    }
  }, [canton, province]);

  /**
   * Handle province selection
   */
  const handleProvinceSelect = async (value: string) => {
    onProvinceChange(value);
    onCantonChange('');
    onDistrictChange('');
    await handleProvinceChange(value);
  };

  /**
   * Handle canton selection
   */
  const handleCantonSelect = async (value: string) => {
    onCantonChange(value);
    onDistrictChange('');
    await handleCantonChange(value);
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 border border-red-300 rounded bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Provincia */}
      <div>
        {showLabels && (
          <Label htmlFor="province">
            Provincia {required && '*'}
          </Label>
        )}
        <Select
          value={province}
          onValueChange={handleProvinceSelect}
          disabled={disabled || isLoading}
        >
          <SelectTrigger id="province" className={errors.province ? 'border-red-500' : ''}>
            <SelectValue placeholder={isLoading ? 'Cargando...' : 'Selecciona una provincia'}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
              {province || (isLoading ? 'Cargando...' : 'Selecciona una provincia')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {provinces.map((prov) => (
              <SelectItem key={prov.id} value={prov.nombre}>
                {prov.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.province && (
          <p className="text-red-500 text-sm mt-1">{errors.province}</p>
        )}
      </div>

      {/* Cantón */}
      <div>
        {showLabels && (
          <Label htmlFor="canton">
            Cantón {required && '*'}
          </Label>
        )}
        <Select
          value={canton}
          onValueChange={handleCantonSelect}
          disabled={disabled || !province || cantones.length === 0}
        >
          <SelectTrigger id="canton" className={errors.canton ? 'border-red-500' : ''}>
            <SelectValue placeholder={
              !province
                ? 'Primero selecciona una provincia'
                : cantones.length === 0
                ? 'Cargando cantones...'
                : 'Selecciona un cantón'
            } />
          </SelectTrigger>
          <SelectContent>
            {cantones.map((cant) => (
              <SelectItem key={cant.id} value={cant.nombre}>
                {cant.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.canton && (
          <p className="text-red-500 text-sm mt-1">{errors.canton}</p>
        )}
      </div>

      {/* Distrito */}
      <div>
        {showLabels && (
          <Label htmlFor="district">
            Distrito {required && '*'}
          </Label>
        )}
        <Select
          value={district}
          onValueChange={onDistrictChange}
          disabled={disabled || !canton || distritos.length === 0}
        >
          <SelectTrigger id="district" className={errors.district ? 'border-red-500' : ''}>
            <SelectValue placeholder={
              !canton
                ? 'Primero selecciona un cantón'
                : distritos.length === 0
                ? 'Cargando distritos...'
                : 'Selecciona un distrito'
            } />
          </SelectTrigger>
          <SelectContent>
            {distritos.map((dist) => (
              <SelectItem key={dist.id} value={dist.nombre}>
                {dist.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.district && (
          <p className="text-red-500 text-sm mt-1">{errors.district}</p>
        )}
      </div>
    </div>
  );
};
