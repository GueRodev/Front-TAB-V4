/**
 * AddressSelector Component
 * Permite seleccionar una dirección guardada o ingresar una nueva usando LocationSelector
 *
 * Funcionalidades:
 * - Carga direcciones guardadas del usuario autenticado
 * - Permite seleccionar una dirección guardada
 * - Permite ingresar dirección manual con dropdowns (Provincia/Cantón/Distrito)
 */

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Plus } from 'lucide-react';
import { LocationSelector } from '@/features/locations-cr';
import { addressesService } from '@/features/addresses/services';
import type { Address } from '@/features/addresses/types';
import type { DeliveryAddress } from '../types';

interface AddressSelectorProps {
  /** Dirección seleccionada actualmente */
  selectedAddress: DeliveryAddress | null;
  /** ID de dirección guardada seleccionada (si aplica) */
  selectedAddressId: string | null;
  /** Callback cuando se selecciona una dirección guardada */
  onSelectSavedAddress: (addressId: string, address: DeliveryAddress) => void;
  /** Callback cuando se ingresa dirección manual */
  onManualAddressChange: (address: DeliveryAddress) => void;
  /** Callback para indicar si se usa dirección guardada o manual */
  onAddressTypeChange?: (type: 'saved' | 'manual') => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  selectedAddressId,
  onSelectSavedAddress,
  onManualAddressChange,
  onAddressTypeChange,
}) => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addressType, setAddressType] = useState<'saved' | 'manual'>('saved');
  const [manualAddress, setManualAddress] = useState<DeliveryAddress>({
    province: '',
    canton: '',
    district: '',
    address: '',
  });

  // Cargar direcciones guardadas del usuario
  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoading(true);
      try {
        const response = await addressesService.getMyAddresses();
        setSavedAddresses(response.data);

        // Si no hay direcciones guardadas, cambiar a modo manual
        if (response.data.length === 0) {
          setAddressType('manual');
          onAddressTypeChange?.('manual');
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        // Si hay error (ej: no autenticado), usar modo manual
        setAddressType('manual');
        onAddressTypeChange?.('manual');
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, []);

  // Manejar cambio de tipo de dirección
  const handleAddressTypeChange = (type: 'saved' | 'manual') => {
    setAddressType(type);
    onAddressTypeChange?.(type);

    // Si cambia a manual, limpiar la dirección manual
    if (type === 'manual') {
      setManualAddress({
        province: '',
        canton: '',
        district: '',
        address: '',
      });
    }
  };

  // Manejar selección de dirección guardada
  const handleSavedAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      onSelectSavedAddress(addressId, {
        province: address.province,
        canton: address.canton,
        district: address.district,
        address: address.address,
      });
    }
  };

  // Manejar cambio en campos de ubicación (dropdowns)
  const handleLocationChange = (field: 'province' | 'canton' | 'district', value: string) => {
    const updated = { ...manualAddress, [field]: value };

    // Limpiar campos dependientes
    if (field === 'province') {
      updated.canton = '';
      updated.district = '';
    } else if (field === 'canton') {
      updated.district = '';
    }

    setManualAddress(updated);
    onManualAddressChange(updated);
  };

  // Manejar cambio en dirección exacta
  const handleAddressDetailsChange = (value: string) => {
    const updated = { ...manualAddress, address: value };
    setManualAddress(updated);
    onManualAddressChange(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando direcciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Dirección de Entrega</Label>

      {/* Selector de tipo: Guardada vs Manual */}
      {savedAddresses.length > 0 && (
        <RadioGroup
          value={addressType}
          onValueChange={(value) => handleAddressTypeChange(value as 'saved' | 'manual')}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="saved" id="type-saved" />
            <Label htmlFor="type-saved" className="cursor-pointer font-normal">
              Usar dirección guardada
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="type-manual" />
            <Label htmlFor="type-manual" className="cursor-pointer font-normal">
              <Plus className="h-4 w-4 inline mr-1" />
              Ingresar nueva dirección
            </Label>
          </div>
        </RadioGroup>
      )}

      {/* Direcciones guardadas */}
      {addressType === 'saved' && savedAddresses.length > 0 && (
        <div className="space-y-2 pt-2">
          <RadioGroup
            value={selectedAddressId || ''}
            onValueChange={handleSavedAddressSelect}
          >
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`flex items-start space-x-3 border rounded-lg p-4 transition-colors cursor-pointer ${
                  selectedAddressId === address.id
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'hover:bg-accent'
                }`}
              >
                <RadioGroupItem value={address.id} id={`addr-${address.id}`} className="mt-1" />
                <Label htmlFor={`addr-${address.id}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-orange" />
                    <span className="font-medium">{address.label}</span>
                    {address.is_default && (
                      <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {address.province}, {address.canton}, {address.district}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {address.address}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Formulario manual con LocationSelector */}
      {(addressType === 'manual' || savedAddresses.length === 0) && (
        <div className="space-y-4 pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Ingresa tu dirección de entrega
          </p>

          {/* Dropdowns de ubicación CR */}
          <LocationSelector
            province={manualAddress.province}
            canton={manualAddress.canton}
            district={manualAddress.district}
            onProvinceChange={(value) => handleLocationChange('province', value)}
            onCantonChange={(value) => handleLocationChange('canton', value)}
            onDistrictChange={(value) => handleLocationChange('district', value)}
            showLabels={true}
            required={true}
          />

          {/* Dirección exacta */}
          <div>
            <Label htmlFor="address-details">Dirección exacta *</Label>
            <Input
              id="address-details"
              placeholder="Calle, número, referencias, señas..."
              value={manualAddress.address}
              onChange={(e) => handleAddressDetailsChange(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Incluye referencias para encontrar fácilmente tu ubicación
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
