/**
 * URL Helpers
 * WhatsApp URL builders using api.whatsapp.com for proper emoji support
 */

import { WHATSAPP_CONFIG } from '@/config';

/**
 * Build WhatsApp chat URL with pre-filled message
 * Uses URL constructor to properly handle emojis
 */
export function buildWhatsAppUrl(message: string, phoneNumber?: string): string {
  const phone = phoneNumber || WHATSAPP_CONFIG.phoneNumber;
  const cleanNumber = phone.replace(/\D/g, '');
  const sanitizedMessage = message.trim().slice(0, 4096);

  const url = new URL('https://api.whatsapp.com/send');
  url.searchParams.set('phone', cleanNumber);
  url.searchParams.set('text', sanitizedMessage);

  return url.toString();
}
