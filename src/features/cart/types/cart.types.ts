/**
 * Cart-related types
 * Centralized types for shopping cart functionality
 */

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  // Optional product details for WhatsApp message
  brand?: string;
  sku?: string;
  categoryName?: string;
}
