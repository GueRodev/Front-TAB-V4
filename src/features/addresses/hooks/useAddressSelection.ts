/**
 * useAddressSelection
 * Business logic for address selection in checkout
 */

import { useState, useMemo } from 'react';
import type { UserProfile } from '@/features/auth';
import type { DeliveryAddress } from '@/features/orders/types';

interface ManualAddress {
  province: string;
  canton: string;
  district: string;
  address: string;
}

export const useAddressSelection = (user: UserProfile | null, isAuthenticated: boolean) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<ManualAddress>({
    province: '',
    canton: '',
    district: '',
    address: '',
  });

  /**
   * Get user's saved addresses
   */
  const userAddresses = useMemo(() => {
    if (!isAuthenticated || user?.role !== 'cliente') return [];
    return (user as any).addresses || [];
  }, [isAuthenticated, user]);

  /**
   * Determine if manual input should be shown
   */
  const showManualInput = selectedAddressId === 'manual' || userAddresses.length === 0;

  /**
   * Handle address selection
   */
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  /**
   * Handle manual address field change
   */
  const handleManualAddressChange = (field: string, value: string) => {
    setManualAddress(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Get the selected address data
   */
  const getSelectedAddress = (): DeliveryAddress | undefined => {
    if (selectedAddressId === 'manual' || userAddresses.length === 0) {
      // Return manual address
      return {
        province: manualAddress.province,
        canton: manualAddress.canton,
        district: manualAddress.district,
        address: manualAddress.address,
      };
    }

    // Return saved address
    const index = parseInt(selectedAddressId.replace('saved-', ''));
    if (!isNaN(index) && userAddresses[index]) {
      return userAddresses[index];
    }

    return undefined;
  };

  return {
    selectedAddressId,
    manualAddress,
    userAddresses,
    showManualInput,
    handleSelectAddress,
    handleManualAddressChange,
    getSelectedAddress,
  };
};
