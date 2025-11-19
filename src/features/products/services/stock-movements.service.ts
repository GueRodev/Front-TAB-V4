/**
 * Stock Movements Service
 * Manages stock tracking, reservations, and inventory history
 * Laravel Integration Ready with localStorage fallback
 */

import { api, STORAGE_KEYS } from '@/api';
import type {
  StockMovement,
  StockAvailability,
  ReserveStockDto,
  AdjustStockDto,
} from '../types';
import { transformLaravelStockMovement } from '../utils';

/**
 * Filters for stock movements queries
 */
export interface StockMovementFilters {
  product_id?: string;
  type?: string;
  user_id?: string;
  order_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

/**
 * Stock Movements Service
 */
class StockMovementsService {
  /**
   * Get stock movements for a specific product
   */
  async getByProduct(productId: string): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>(
      `/products/${productId}/stock-movements`
    );
    return response.data.map(transformLaravelStockMovement);
  }

  /**
   * Get all stock movements with optional filters
   */
  async getAll(filters?: StockMovementFilters): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>('/stock-movements', {
      params: filters,
    });
    return response.data.map(transformLaravelStockMovement);
  }

  /**
   * Check stock availability for multiple items
   * Used before order creation to validate stock
   */
  async checkAvailability(
    items: Array<{ product_id: string; quantity: number }>
  ): Promise<StockAvailability> {
    const response = await api.post<StockAvailability>(
      '/stock-movements/check-availability',
      { items }
    );
    return response.data;
  }

  /**
   * Reserve stock for a pending order
   * Creates 'reserva' movements for each item
   */
  async reserveStock(dto: ReserveStockDto): Promise<void> {
    await api.post('/stock-movements/reserve', dto);
  }

  /**
   * Confirm sale and deduct real stock
   * Creates 'venta' movements and updates product stock
   */
  async confirmSale(orderId: string): Promise<void> {
    await api.post(`/stock-movements/confirm-sale/${orderId}`);
  }

  /**
   * Cancel reservation and release stock
   * Creates 'cancelacion_reserva' movements
   */
  async cancelReservation(orderId: string): Promise<void> {
    await api.post(`/stock-movements/cancel-reservation/${orderId}`);
  }

  /**
   * Manual stock adjustment
   * Creates 'entrada', 'salida', or 'ajuste' movement
   */
  async adjustStock(
    productId: string,
    dto: AdjustStockDto
  ): Promise<StockMovement> {
    const response = await api.post<StockMovement>(
      `/products/${productId}/stock`,
      dto
    );
    return transformLaravelStockMovement(response.data);
  }

  // Helper methods for localStorage (kept for type compatibility)
  private getLocalProducts(): any[] {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    return stored ? JSON.parse(stored) : [];
  }

  private getLocalOrders(): any[] {
    const stored = localStorage.getItem(STORAGE_KEYS.orders);
    return stored ? JSON.parse(stored) : [];
  }
}

export const stockMovementsService = new StockMovementsService();
