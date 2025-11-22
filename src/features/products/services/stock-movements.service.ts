/**
 * Stock Movements Service
 * Manages stock tracking and inventory history
 *
 * NOTA IMPORTANTE:
 * Las operaciones de reserva, confirmación de venta y cancelación de reserva
 * son manejadas INTERNAMENTE por el backend (OrderService + StockReservationService).
 *
 * Este servicio solo expone:
 * - getByProduct: Historial de movimientos por producto
 * - checkAvailability: Verificar stock antes de crear orden (para UX)
 * - adjustStock: Ajuste manual de stock (entrada/salida/ajuste)
 */

import { api, API_ENDPOINTS } from '@/api';
import type {
  StockMovement,
  StockAvailability,
  AdjustStockDto,
} from '../types';
import { transformLaravelStockMovement } from '../utils';

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
   * Check stock availability for multiple items
   * Used before order creation to validate stock and show user-friendly errors
   * 🔗 LARAVEL: POST /api/v1/stock-movements/check-availability
   *
   * @param items Array of items to check: [{ product_id: "1", quantity: 2 }, ...]
   * @returns { available: boolean, errors: Array<{ product_id, product_name, requested, available, message }> }
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
   * Manual stock adjustment
   * Creates 'entrada', 'salida', or 'ajuste' movement
   * 🔗 LARAVEL: POST /api/v1/products/{id}/stock
   *
   * @param productId Product ID to adjust
   * @param dto { type: 'entrada'|'salida'|'ajuste', quantity: number, reason?: string }
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
