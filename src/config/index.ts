/**
 * Configuration Layer - Main Entry Point
 */

// Re-export from app.config
export {
  WHATSAPP_CONFIG,
  CURRENCY_CONFIG,
  PAGINATION_CONFIG,
  PAYMENT_METHODS,
  DELIVERY_OPTIONS,
  FILE_UPLOAD_CONFIG,
} from "./app.config";

export type { PaymentMethod, DeliveryOption } from "./app.config";

// Re-export API constants
export { api, API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from "@/api";
