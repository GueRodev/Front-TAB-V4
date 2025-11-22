/**
 * Order Form Business Logic Hook
 * Handles order form state, validation, and submission
 *
 * Soporta:
 * - Direcciones guardadas del usuario (address_id)
 * - Direcciones manuales con dropdowns (province/canton/district)
 */

import { useState, useEffect } from 'react';
import { useOrders } from '../contexts';
import { useNotifications } from '@/features/notifications';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { toast } from '@/hooks/use-toast';
import { orderFormSchema } from '../validations';
import { WHATSAPP_CONFIG } from '@/config/app.config';
import type { DeliveryAddress, DeliveryOption } from '../types';

/**
 * Order form data structure
 */
interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

const INITIAL_FORM_STATE: OrderFormData = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
};

export const useOrderForm = () => {
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_FORM_STATE);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('pickup');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Estado para dirección de envío
  const [addressType, setAddressType] = useState<'saved' | 'manual'>('saved');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);

  const { addOrder } = useOrders();
  const { addNotification } = useNotifications();
  const { items: cart, clearCart } = useCart();
  const { user } = useAuth();

  /**
   * Autocomplete form with user data when available
   */
  useEffect(() => {
    if (user && !formData.customerName && !formData.customerPhone) {
      setFormData({
        customerName: user.name || '',
        customerPhone: user.phone || '',
        customerEmail: user.email || '',
      });
    }
  }, [user]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setDeliveryOption('pickup');
    setPaymentMethod('');
    setAddressType('saved');
    setSelectedAddressId(null);
    setDeliveryAddress(null);
  };

  /**
   * Automatically adjust payment method when delivery option changes
   */
  useEffect(() => {
    if (deliveryOption === 'delivery') {
      // For delivery, default to transfer if current method is not allowed
      if (paymentMethod !== 'transfer' && paymentMethod !== 'sinpe') {
        setPaymentMethod('transfer');
      }
    }
  }, [deliveryOption, paymentMethod]);

  /**
   * Handle saved address selection
   */
  const handleSavedAddressSelect = (addressId: string, address: DeliveryAddress) => {
    setSelectedAddressId(addressId);
    setDeliveryAddress(address);
    setAddressType('saved');
  };

  /**
   * Handle manual address change
   */
  const handleManualAddressChange = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    setSelectedAddressId(null);
    setAddressType('manual');
  };

  /**
   * Handle address type change
   */
  const handleAddressTypeChange = (type: 'saved' | 'manual') => {
    setAddressType(type);
    if (type === 'manual') {
      setSelectedAddressId(null);
    }
  };

  /**
   * Validate form data before submission
   */
  const validateForm = (): boolean => {
    const validationData = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deliveryOption,
      paymentMethod,
      deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
    };

    const result = orderFormSchema.safeParse(validationData);

    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Error de validación",
        description: firstError.message,
        variant: "destructive",
      });
      return false;
    }

    // Validación adicional para delivery
    if (deliveryOption === 'delivery') {
      if (!selectedAddressId && !deliveryAddress) {
        toast({
          title: "Error de validación",
          description: "Debe seleccionar o ingresar una dirección de envío",
          variant: "destructive",
        });
        return false;
      }

      // Validar que la dirección manual esté completa
      if (addressType === 'manual' && deliveryAddress) {
        if (!deliveryAddress.province || !deliveryAddress.canton ||
            !deliveryAddress.district || !deliveryAddress.address) {
          toast({
            title: "Error de validación",
            description: "Debe completar todos los campos de la dirección",
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  /**
   * Build WhatsApp message with order details
   */
  const buildWhatsAppMessage = (orderId: string): string => {
    // Build detailed product list
    const items = cart.map(item => {
      let productLine = `• *${item.name}*`;

      // Add category and brand if available
      const details: string[] = [];
      if (item.categoryName) details.push(item.categoryName);
      if (item.brand) details.push(item.brand);
      if (item.sku) details.push(`SKU: ${item.sku}`);

      if (details.length > 0) {
        productLine += `\n  _${details.join(' | ')}_`;
      }

      productLine += `\n  Cantidad: ${item.quantity} | Precio: ₡${item.price.toLocaleString('es-CR')} | Subtotal: ₡${(item.price * item.quantity).toLocaleString('es-CR')}`;

      return productLine;
    }).join('\n\n');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get payment method label
    const paymentLabels: Record<string, string> = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'sinpe': 'SINPE Móvil',
    };
    const paymentLabel = paymentLabels[paymentMethod] || paymentMethod;

    let message = `🛒 *NUEVO PEDIDO #${orderId}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `👤 *DATOS DEL CLIENTE*\n`;
    message += `• Nombre: ${formData.customerName}\n`;
    message += `• Teléfono: ${formData.customerPhone}\n`;
    if (formData.customerEmail) {
      message += `• Correo: ${formData.customerEmail}\n`;
    }

    message += `\n📦 *PRODUCTOS*\n`;
    message += `${items}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL: ₡${total.toLocaleString('es-CR')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (deliveryOption === 'delivery' && deliveryAddress) {
      message += `🚚 *ENTREGA A DOMICILIO*\n`;
      message += `• Provincia: ${deliveryAddress.province}\n`;
      message += `• Cantón: ${deliveryAddress.canton}\n`;
      message += `• Distrito: ${deliveryAddress.district}\n`;
      message += `• Dirección: ${deliveryAddress.address}\n\n`;
    } else {
      message += `🏪 *RETIRO EN TIENDA*\n\n`;
    }

    message += `💳 *Método de pago:* ${paymentLabel}`;

    // Encode the message for URL
    return encodeURIComponent(message);
  };

  /**
   * Submit order form
   */
  const submitOrder = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    // Build order data
    const orderData: any = {
      type: 'online' as const,
      status: 'pending' as const,
      items: cart.map(item => ({
        id: item.id,
        product_id: Number(item.id),
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      customerInfo: {
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail || user?.email,
      },
      deliveryOption,
      paymentMethod,
    };

    // Add address data depending on type
    if (deliveryOption === 'delivery') {
      if (addressType === 'saved' && selectedAddressId) {
        // Use saved address ID - backend will load the address
        orderData.address_id = selectedAddressId;
      } else if (deliveryAddress) {
        // Use manual address with names
        orderData.delivery_address = deliveryAddress;
      }
    }

    try {
      // Context internally calls the service and calculates subtotal/total
      const orderId = await addOrder(orderData);

      // Add notification
      addNotification({
        type: 'order',
        title: 'Nuevo pedido',
        message: `Pedido #${orderId} recibido de ${formData.customerName}`,
        time: 'Ahora',
      });

      // Build WhatsApp message and open chat
      const message = buildWhatsAppMessage(orderId);
      const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      // Clear cart and reset form
      clearCart();
      resetForm();

      toast({
        title: "Pedido enviado",
        description: "Tu pedido ha sido enviado correctamente",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pedido. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return {
    // Form state
    formData,
    deliveryOption,
    paymentMethod,

    // Address state
    addressType,
    selectedAddressId,
    deliveryAddress,

    // Form actions
    handleInputChange,
    setDeliveryOption,
    setPaymentMethod,
    resetForm,

    // Address actions
    handleSavedAddressSelect,
    handleManualAddressChange,
    handleAddressTypeChange,

    // Validation & submission
    validateForm,
    submitOrder,
    buildWhatsAppMessage,
  };
};
