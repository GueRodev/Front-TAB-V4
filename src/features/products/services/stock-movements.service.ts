/**
 * Stock Movements Service
 * Manages stock tracking, reservations, and inventory history
 * ✅ Fully integrated with Laravel backend
 */

import { api, API_ENDPOINTS } from '@/api';
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
   * 🔗 LARAVEL: GET /api/v1/products/{id}/stock-movements
   */
  async getByProduct(productId: string): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>(
      API_ENDPOINTS.PRODUCT_STOCK_MOVEMENTS(productId)
    );
    return response.data.map(transformLaravelStockMovement);
  }

  /**
   * Get all stock movements with optional filters
   * ⏳ TODO: Implement in Orders feature
   */
  async getAll(filters?: StockMovementFilters): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>('/v1/stock-movements', {
      params: filters,
    });
    return response.data.map(transformLaravelStockMovement);
  }

  /**
   * Check stock availability for multiple items
   * Used before order creation to validate stock
   * ⏳ TODO: Implement in Orders feature
   */
  async checkAvailability(
    items: Array<{ product_id: string; quantity: number }>
  ): Promise<StockAvailability> {
    const response = await api.post<StockAvailability>(
      '/v1/stock-movements/check-availability',
      { items }
    );
    return response.data;
  }

  /**
   * Reserve stock for a pending order
   * Creates 'reserva' movements for each item
   * ⏳ TODO: Implement in Orders feature
   */
  async reserveStock(dto: ReserveStockDto): Promise<void> {
    await api.post('/v1/stock-movements/reserve', dto);
  }

  /**
   * Confirm sale and deduct real stock
   * Creates 'venta' movements and updates product stock
   * ⏳ TODO: Implement in Orders feature
   */
  async confirmSale(orderId: string): Promise<void> {
    await api.post(`/v1/stock-movements/confirm-sale/${orderId}`);
  }

  /**
   * Cancel reservation and release stock
   * Creates 'cancelacion_reserva' movements
   * ⏳ TODO: Implement in Orders feature
   */
  async cancelReservation(orderId: string): Promise<void> {
    await api.post(`/v1/stock-movements/cancel-reservation/${orderId}`);
  }

  /**
   * Manual stock adjustment
   * Creates 'entrada', 'salida', or 'ajuste' movement
   * 🔗 LARAVEL: POST /api/v1/products/{id}/stock
   */
  async adjustStock(
    productId: string,
    dto: AdjustStockDto
  ): Promise<StockMovement> {
    const response = await api.post<StockMovement>(
      API_ENDPOINTS.PRODUCT_STOCK(productId),
      dto
    );
    return transformLaravelStockMovement(response.data);
  }
}

export const stockMovementsService = new StockMovementsService();
