/**
 * Order Form Business Logic Hook
 * Handles order form state, validation, and submission
 */

import { useState, useEffect } from 'react';
import { useOrders } from '../contexts';
import { useNotifications } from '@/features/notifications';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { toast } from '@/hooks/use-toast';
import { orderFormSchema } from '../validations';
import type { DeliveryAddress, DeliveryOption } from '../types';

/**
 * Order form data structure
 */
interface OrderFormData {
  customerName: string;
  customerPhone: string;
}

const INITIAL_FORM_STATE: OrderFormData = {
  customerName: '',
  customerPhone: '',
};

export const useOrderForm = () => {
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_FORM_STATE);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('pickup');
  const [paymentMethod, setPaymentMethod] = useState('');

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
   * Validate form data before submission
   */
  const validateForm = (
    deliveryAddress?: DeliveryAddress,
  ): boolean => {
    const validationData = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deliveryOption,
      paymentMethod,
      deliveryAddress,
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

    return true;
  };

  /**
   * Build WhatsApp message with order details
   */
  const buildWhatsAppMessage = (
    orderId: string,
    deliveryAddress?: DeliveryAddress,
  ): string => {
    const items = cart.map(item => 
      `• ${item.name} x${item.quantity} - ₡${(item.price * item.quantity).toLocaleString('es-CR')}`
    ).join('%0A');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let message = `*Nuevo Pedido #${orderId}*%0A%0A`;
    message += `*Cliente:* ${formData.customerName}%0A`;
    message += `*Teléfono:* ${formData.customerPhone}%0A%0A`;
    message += `*Productos:*%0A${items}%0A%0A`;
    message += `*Total:* ₡${total.toLocaleString('es-CR')}%0A%0A`;
    
    if (deliveryOption === 'delivery' && deliveryAddress) {
      message += `*Entrega a domicilio*%0A`;
      message += `*Provincia:* ${deliveryAddress.province}%0A`;
      message += `*Cantón:* ${deliveryAddress.canton}%0A`;
      message += `*Distrito:* ${deliveryAddress.district}%0A`;
      message += `*Dirección:* ${deliveryAddress.address}%0A%0A`;
    } else {
      message += `*Retiro en tienda*%0A%0A`;
    }
    
    message += `*Método de pago:* ${paymentMethod}%0A`;

    return message;
  };

  /**
   * Submit order form
   */
  const submitOrder = async (
    deliveryAddress?: DeliveryAddress,
  ) => {
    // Validate form first
    if (!validateForm(deliveryAddress)) {
      return;
    }

    const orderData = {
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
      },
      deliveryOption,
      delivery_address: deliveryAddress,
      paymentMethod,
    };

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

      // Build WhatsApp message
      const message = buildWhatsAppMessage(orderId, deliveryAddress);
      const whatsappUrl = `https://wa.me/50688888888?text=${message}`;
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
    
    // Form actions
    handleInputChange,
    setDeliveryOption,
    setPaymentMethod,
    resetForm,
    
    // Validation & submission
    validateForm,
    submitOrder,
    buildWhatsAppMessage,
  };
};
