/**
 * Application Configuration
 * Business constants and app settings
 */

// ============================================
// WhatsApp Configuration
// ============================================
export const WHATSAPP_CONFIG = {
  phoneNumber: "50689176111",
  countryCode: "+506",

  // Uses URL constructor for proper emoji support
  buildChatUrl: (message: string): string => {
    const url = new URL('https://api.whatsapp.com/send');
    url.searchParams.set('phone', '50689176111');
    url.searchParams.set('text', message);
    return url.toString();
  },
} as const;

// ============================================
// Currency Configuration
// ============================================
export const CURRENCY_CONFIG = {
  code: "CRC",
  symbol: "₡",
  locale: "es-CR",
} as const;

// ============================================
// Pagination Configuration
// ============================================
export const PAGINATION_CONFIG = {
  defaultPageSize: 12,
  maxPageSize: 100,
} as const;

// ============================================
// Payment & Delivery Options
// ============================================
export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "sinpe", label: "SINPE Móvil" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const DELIVERY_OPTIONS = [
  { value: "pickup", label: "Recoger en tienda" },
  { value: "delivery", label: "Envío" },
] as const;

export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number]["value"];

// ============================================
// File Upload Configuration
// ============================================
export const FILE_UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
} as const;
