/**
 * OrderForm Component
 * Pure presentational component for order form UI
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DELIVERY_OPTIONS } from '@/config/app.config';
import { PaymentMethodSelector } from '@/features/orders/components';
import type { DeliveryOption } from '@/features/orders/types';

interface OrderFormProps {
  formData: {
    name: string;
    phone: string;
  };
  deliveryOption: DeliveryOption;
  paymentMethod: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeliveryOptionChange: (option: DeliveryOption) => void;
  onPaymentMethodChange: (method: string) => void;
  onSubmit: () => void;
  children?: React.ReactNode;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  formData,
  deliveryOption,
  paymentMethod,
  onInputChange,
  onDeliveryOptionChange,
  onPaymentMethodChange,
  onSubmit,
  children,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Formulario de Pedido</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            name="customerName"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            name="customerPhone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="Tu número de teléfono"
            required
          />
        </div>

        <div>
          <Label className="mb-3 block font-semibold">Tipo de entrega *</Label>
          <RadioGroup value={deliveryOption} onValueChange={(value) => onDeliveryOptionChange(value as DeliveryOption)}>
            {DELIVERY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {deliveryOption === 'delivery' && children && (
          <div className="space-y-4 pt-2 border-t">
            <h3 className="font-semibold text-sm text-gray-700">Datos de envío</h3>
            {children}
          </div>
        )}

        <PaymentMethodSelector
          value={paymentMethod}
          onChange={onPaymentMethodChange}
          deliveryOption={deliveryOption}
        />

        {(paymentMethod === 'sinpe' || paymentMethod === 'transfer') && (
          <p className="text-xs text-muted-foreground">
            * Debe enviar el comprobante por WhatsApp
          </p>
        )}

        <Button 
          onClick={onSubmit}
          className="w-full bg-brand-darkBlue hover:bg-brand-orange text-white"
        >
          Finalizar Compra
        </Button>
      </div>
    </div>
  );
};
