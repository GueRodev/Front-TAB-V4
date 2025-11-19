/**
 * AddressSelector Component
 * Reusable component for selecting delivery addresses
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { DeliveryAddress } from '../types';

interface AddressSelectorProps {
  savedAddresses: DeliveryAddress[];
  selectedAddressId: string;
  onSelectAddress: (addressId: string) => void;
  manualAddress: {
    province: string;
    canton: string;
    district: string;
    address: string;
  };
  onManualAddressChange: (field: string, value: string) => void;
  showManualInput: boolean;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  manualAddress,
  onManualAddressChange,
  showManualInput,
}) => {
  return (
    <div className="space-y-3">
      <Label>Dirección de Entrega</Label>
      
      {savedAddresses.length > 0 && (
        <RadioGroup value={selectedAddressId} onValueChange={onSelectAddress}>
          {savedAddresses.map((address, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <RadioGroupItem value={`saved-${idx}`} id={`saved-${idx}`} />
              <Label htmlFor={`saved-${idx}`} className="flex-1 cursor-pointer">
                <div className="text-sm text-muted-foreground">
                  {address.province}, {address.canton}, {address.district}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {address.address}
                </div>
              </Label>
            </div>
          ))}
          
          <div
            className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors"
          >
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="cursor-pointer font-medium">
              Ingresar dirección manualmente
            </Label>
          </div>
        </RadioGroup>
      )}

      {(showManualInput || savedAddresses.length === 0) && (
        <div className="space-y-3 pt-2">
          <Input
            placeholder="Provincia"
            value={manualAddress.province}
            onChange={(e) => onManualAddressChange('province', e.target.value)}
          />
          <Input
            placeholder="Cantón"
            value={manualAddress.canton}
            onChange={(e) => onManualAddressChange('canton', e.target.value)}
          />
          <Input
            placeholder="Distrito"
            value={manualAddress.district}
            onChange={(e) => onManualAddressChange('district', e.target.value)}
          />
          <Textarea
            placeholder="Dirección exacta (señas)"
            value={manualAddress.address}
            onChange={(e) => onManualAddressChange('address', e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  );
};
