/**
 * Orders Context
 * Manages order history and status
 *
 * NOTA: El backend (OrderService + StockReservationService) maneja internamente:
 * - Reserva de stock al crear orden
 * - Confirmación de venta al completar orden
 * - Liberación de stock al cancelar orden
 *
 * Por lo tanto, este contexto solo necesita:
 * - checkAvailability: validación pre-orden para mostrar errores al usuario
 * - Las demás operaciones de stock las hace el backend automáticamente
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ordersService } from '../services';
import { stockMovementsService } from '@/features/products/services';
import type { Order, OrderStatus, OrderType } from '../types';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/config';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'order_number' | 'subtotal' | 'shipping_cost' | 'total' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  markInProgress: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  archiveOrder: (orderId: string) => Promise<void>;
  unarchiveOrder: (orderId: string) => Promise<void>;
  getOrdersByType: (type: OrderType) => Order[];
  getArchivedOrders: () => Order[];
  getCompletedOrders: () => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from service on mount (only if authenticated)
  useEffect(() => {
    const loadOrders = async () => {
      // Only load orders if user is authenticated (has token)
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return;

      try {
        const loadedOrders = await ordersService.getAll();
        setOrders(loadedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };
    loadOrders();
  }, []);

  const addOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'order_number' | 'subtotal' | 'shipping_cost' | 'total' | 'updatedAt'>
  ): Promise<string> => {
    // 1. Calculate subtotal from items
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // 2. Shipping cost is always 0 (backend doesn't use it yet)
    const shipping_cost = 0;

    // 3. Total = subtotal (no shipping for now)
    const total = subtotal;

    // 4. Ensure each item has subtotal calculated
    const itemsWithSubtotal = orderData.items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));

    // 5. Build complete order data
    const completeOrderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      ...orderData,
      items: itemsWithSubtotal,
      order_number: '', // Laravel generates this
      subtotal,
      shipping_cost,
      total,
    };

    // 6. Check stock availability before creating order (validación para UX)
    const items = completeOrderData.items.map(item => ({
      product_id: String(item.product_id),
      quantity: item.quantity,
    }));

    try {
      const availability = await stockMovementsService.checkAvailability(items);

      if (!availability.available) {
        const errorMessages = availability.errors
          .map(err => `${err.product_name}: solicitado ${err.requested}, disponible ${err.available}`)
          .join(', ');

        toast.error('Stock insuficiente', {
          description: errorMessages,
        });

        throw new Error('Stock insuficiente para completar el pedido');
      }

      // 7. Create order via service
      // NOTA: El backend automáticamente:
      // - Verifica stock (doble verificación)
      // - Crea la orden
      // - Reserva el stock
      const result = await ordersService.create(completeOrderData);

      // 8. Update local state
      setOrders(prev => [result.data, ...prev]);

      toast.success('Pedido creado', {
        description: `Pedido #${result.data.order_number} creado exitosamente`,
      });

      return result.data.id;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      const currentOrder = orders.find(o => o.id === orderId);

      if (!currentOrder) {
        throw new Error('Pedido no encontrado');
      }

      const previousStatus = currentOrder.status;

      // Validate status transitions
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        'pending': ['in_progress', 'completed', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
        'archived': [],
      };

      if (!validTransitions[previousStatus]?.includes(status)) {
        toast.error('Transición inválida', {
          description: `No se puede cambiar de "${previousStatus}" a "${status}"`,
        });
        return;
      }

      // Call service
      // NOTA: El backend automáticamente maneja los movimientos de stock:
      // - complete: confirma la venta y descuenta stock real
      // - cancel: libera la reserva de stock
      await ordersService.updateStatus(orderId, status);

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );

      toast.success('Estado actualizado', {
        description: `Pedido actualizado a "${status}"`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error', {
        description: 'No se pudo actualizar el estado',
      });
      throw error;
    }
  };

  const markInProgress = async (orderId: string): Promise<void> => {
    try {
      const currentOrder = orders.find(o => o.id === orderId);

      if (!currentOrder) {
        throw new Error('Pedido no encontrado');
      }

      // Validate transition (only from pending)
      if (currentOrder.status !== 'pending') {
        toast.error('Transición inválida', {
          description: 'Solo se pueden marcar como "en proceso" los pedidos pendientes',
        });
        return;
      }

      // Call service
      await ordersService.markInProgress(orderId);

      // Stock remains reserved (no movement needed - backend handles this)

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'in_progress' as OrderStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );

      toast.success('Pedido actualizado', {
        description: 'El pedido está ahora en proceso',
      });
    } catch (error) {
      console.error('Error marking order in progress:', error);
      toast.error('Error', {
        description: 'No se pudo actualizar el pedido',
      });
      throw error;
    }
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    // Call service to persist
    // NOTA: El backend libera el stock si el pedido está pending/in_progress
    await ordersService.deleteOrder(orderId);

    // Update local state
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const archiveOrder = async (orderId: string): Promise<void> => {
    // Call service to persist
    await ordersService.archive(orderId);

    // Update local state
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'archived' as OrderStatus, archived: true, archivedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const unarchiveOrder = async (orderId: string): Promise<void> => {
    // Call service to persist
    await ordersService.unarchive(orderId);

    // Update local state
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' as OrderStatus, archived: false, archivedAt: undefined }
          : order
      )
    );
  };

  const getOrdersByType = (type: OrderType): Order[] => {
    return orders.filter(order => order.type === type && !order.archived);
  };

  const getArchivedOrders = (): Order[] => {
    return orders.filter(order => order.archived || order.status === 'archived');
  };

  const getCompletedOrders = (): Order[] => {
    return orders.filter(order =>
      order.status === 'completed' || order.status === 'cancelled'
    );
  };

  const value: OrdersContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    markInProgress,
    deleteOrder,
    archiveOrder,
    unarchiveOrder,
    getOrdersByType,
    getArchivedOrders,
    getCompletedOrders,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
};
