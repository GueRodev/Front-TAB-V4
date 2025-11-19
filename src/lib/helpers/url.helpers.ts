/**
 * URL Helpers
 * WhatsApp URL builders
 */

import { WHATSAPP_CONFIG, CURRENCY_CONFIG } from '@/config';

/**
 * Build WhatsApp chat URL with pre-filled message
 */
export function buildWhatsAppUrl(message: string, phoneNumber?: string): string {
  const phone = phoneNumber || WHATSAPP_CONFIG.phoneNumber;
  const cleanNumber = phone.replace(/\D/g, '');
  
  const sanitizedMessage = message.trim().slice(0, 1000);
  const encodedMessage = encodeURIComponent(sanitizedMessage);
  
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Build WhatsApp URL for order notification
 */
export function buildWhatsAppOrderUrl(orderData: {
  orderId: string;
  customerName: string;
  total: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  deliveryOption?: string;
  address?: string;
}): string {
  let message = `*NUEVO PEDIDO #${orderData.orderId}*\n\n`;
  message += `👤 *Cliente:* ${orderData.customerName}\n`;
  message += `💰 *Total:* ${orderData.total}\n\n`;
  message += `📦 *Productos:*\n`;
  
  orderData.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} x${item.quantity} - ${CURRENCY_CONFIG.symbol}${item.price}\n`;
  });
  
  if (orderData.deliveryOption) {
    message += `\n🚚 *Entrega:* ${orderData.deliveryOption}\n`;
  }
  
  if (orderData.address) {
    message += `📍 *Dirección:* ${orderData.address}\n`;
  }
  
  return buildWhatsAppUrl(message);
}
