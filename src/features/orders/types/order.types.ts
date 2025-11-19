/**
 * Order-related types
 * Centralized types for orders and order items
 */

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'archived';
export type OrderType = 'online' | 'in-store';
export type DeliveryOption = 'pickup' | 'delivery';

export interface OrderItem {
  id: string;
  product_id: number;
  name: string;
  product_sku?: string;
  product_description?: string;
  image: string;
  price: number;
  quantity: number;
  subtotal?: number;
}

export interface DeliveryAddress {
  province: string;
  canton: string;
  district: string;
  address: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
  customerInfo: CustomerInfo;
  delivery_address?: DeliveryAddress;
  deliveryOption?: DeliveryOption;
  paymentMethod?: string;
  notes?: string;
  archived?: boolean;
  archivedAt?: string;
  deleted_at?: string | null;
}
