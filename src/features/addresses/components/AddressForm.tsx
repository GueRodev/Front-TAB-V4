/**
 * AddressForm Component
 * ✅ MEJORADO CON LocationSelector
 * Form for creating/editing addresses with CR locations integration
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationSelector } from '@/features/locations-cr';
import type { Address } from '../types';

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    label: address?.label || 'Casa',
    province: address?.province || '',
    canton: address?.canton || '',
    district: address?.district || '',
    address: address?.address || '',
    is_default: address?.is_default || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label Selection */}
      <div>
        <Label htmlFor="label">Etiqueta *</Label>
        <Select value={formData.label} onValueChange={(value) => handleChange('label', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Casa">Casa</SelectItem>
            <SelectItem value="Trabajo">Trabajo</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location Selection - Using LocationSelector Component */}
      <LocationSelector
        province={formData.province}
        canton={formData.canton}
        district={formData.district}
        onProvinceChange={(value) => handleChange('province', value)}
        onCantonChange={(value) => handleChange('canton', value)}
        onDistrictChange={(value) => handleChange('district', value)}
        showLabels={true}
        required={true}
      />

      {/* Exact Address */}
      <div>
        <Label htmlFor="address">Dirección exacta *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          required
          placeholder="Calle, número, referencias..."
          minLength={10}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-brand-orange hover:bg-brand-orange/90">
          {address ? 'Actualizar' : 'Guardar'} Dirección
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
};
