/**
 * AddressForm Component
 * Form for creating/editing addresses
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <div>
        <Label htmlFor="label">Etiqueta *</Label>
        <Select value={formData.label} onValueChange={(value) => handleChange('label', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Casa">Casa</SelectItem>
            <SelectItem value="Trabajo">Trabajo</SelectItem>
            <SelectItem value="Oficina">Oficina</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="province">Provincia *</Label>
        <Input
          id="province"
          value={formData.province}
          onChange={(e) => handleChange('province', e.target.value)}
          required
          placeholder="San José"
        />
      </div>

      <div>
        <Label htmlFor="canton">Cantón *</Label>
        <Input
          id="canton"
          value={formData.canton}
          onChange={(e) => handleChange('canton', e.target.value)}
          required
          placeholder="Central"
        />
      </div>

      <div>
        <Label htmlFor="district">Distrito *</Label>
        <Input
          id="district"
          value={formData.district}
          onChange={(e) => handleChange('district', e.target.value)}
          required
          placeholder="Carmen"
        />
      </div>

      <div>
        <Label htmlFor="address">Dirección exacta *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          required
          placeholder="Calle, número, referencias..."
        />
      </div>

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
