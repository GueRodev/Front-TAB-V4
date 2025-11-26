/**
 * Stock Movement Types - Laravel Backend
 * Complete stock traceability system
 */

import type { Product } from './product.types';
import type { Order } from '@/features/orders/types';

/**
 * Types of stock movements
 */
export type StockMovementType = 
  | 'entrada'              // Stock entry/purchase
  | 'salida'               // Manual exit
  | 'ajuste'               // Inventory adjustment/correction
  | 'reserva'              // Reservation for pending order
  | 'venta'                // Confirmed sale (deducts real stock)
  | 'cancelacion_reserva'; // Release reservation on order cancellation

/**
 * Stock Movement entity
 * Tracks all stock changes with full traceability
 */
export interface StockMovement {
  id: string;                          // Transformed from number
  product_id: string;                  // Transformed from number
  type: StockMovementType;
  quantity: number;                    // Negative for exits/sales
  stock_before: number;
  stock_after: number;
  reason: string | null;
  user_id: string;                     // Transformed from number
  order_id: string | null;             // Transformed from number (optional)
  created_at: string;
  updated_at: string;
  
  // Eager loaded relations (optional)
  product?: Product;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order?: Order;
}

/**
 * DTO for stock adjustment
 */
export interface AdjustStockDto {
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  reason?: string;
}

/**
 * Stock availability check response
 */
export interface StockAvailability {
  available: boolean;
  errors: StockAvailabilityError[];
}

/**
 * Individual product availability error
 */
export interface StockAvailabilityError {
  product_id: string;
  product_name: string;
  requested: number;
  available: number;
  message: string;
}

/**
 * Stock reservation request
 */
export interface ReserveStockDto {
  order_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}
