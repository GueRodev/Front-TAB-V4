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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ordersService } from '../services';
import { stockMovementsService } from '@/features/products/services';
import type { Order, OrderStatus, OrderType } from '../types';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/config';
import { useAuth } from '@/features/auth';

interface OrdersContextType {
  // Pedidos activos (pending only - in_progress disabled)
  orders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;

  // Historial de pedidos (completed, cancelled, deleted) - desde backend
  historyOrders: Order[];
  isLoadingHistory: boolean;
  refreshHistory: () => Promise<void>;

  // Acciones
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'order_number' | 'subtotal' | 'shipping_cost' | 'total' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  // markInProgress: (orderId: string) => Promise<void>; // In-progress functionality disabled
  deleteOrder: (orderId: string) => Promise<void>;
  // archiveOrder: (orderId: string) => Promise<void>; // Archived functionality disabled
  // unarchiveOrder: (orderId: string) => Promise<void>; // Archived functionality disabled
  // restoreOrder: (orderId: string) => Promise<void>; // Restore functionality disabled

  // Filtros locales (para pedidos activos)
  getOrdersByType: (type: OrderType) => Order[];
  // getArchivedOrders: () => Order[]; // Archived functionality disabled
  getCompletedOrders: () => Order[];
  getPendingOrders: () => Order[];

  // Filtros para historial (desde el estado historyOrders)
  getHistoryOrders: () => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getTrashedOrders: () => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para pedidos activos
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para historial (desde backend con filtros)
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // Function to load/refresh active orders (pending, in_progress)
  const refreshOrders = useCallback(async () => {
    // Only load orders if user is authenticated
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token || !isAuthenticated) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      // Pass isAdmin to use correct endpoint
      const loadedOrders = await ordersService.getAll(isAdmin);
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Function to load/refresh history orders from backend (completed, cancelled, archived)
  const refreshHistory = useCallback(async () => {
    // Only load if user is admin
    if (!isAuthenticated || !isAdmin) {
      setHistoryOrders([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      // Usa el servicio que hace llamadas paralelas al backend con filtros
      const history = await ordersService.getHistory();
      setHistoryOrders(history);
    } catch (error) {
      console.error('Error loading order history:', error);
      setHistoryOrders([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Load orders when user changes (login/logout/switch user)
  useEffect(() => {
    refreshOrders();
  }, [user?.id, isAuthenticated, refreshOrders]);

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

      // Nota: No mostramos toast aquí, lo hace el hook que llama a addOrder

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

      // Validate status transitions (in_progress and archived disabled)
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        'pending': ['completed', 'cancelled'], // Removed 'in_progress'
        // 'in_progress': ['completed', 'cancelled'], // In-progress functionality disabled
        'completed': [],
        'cancelled': [],
        // 'archived': [], // Archived functionality disabled
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

      // Nota: No mostramos toast aquí, lo hace el hook useOrdersAdmin
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // In-progress functionality disabled
  // const markInProgress = async (orderId: string): Promise<void> => {
  //   try {
  //     const currentOrder = orders.find(o => o.id === orderId);

  //     if (!currentOrder) {
  //       throw new Error('Pedido no encontrado');
  //     }

  //     // Validate transition (only from pending)
  //     if (currentOrder.status !== 'pending') {
  //       toast.error('Transición inválida', {
  //         description: 'Solo se pueden marcar como "en proceso" los pedidos pendientes',
  //       });
  //       return;
  //     }

  //     // Call service
  //     await ordersService.markInProgress(orderId);

  //     // Stock remains reserved (no movement needed - backend handles this)

  //     // Update local state
  //     setOrders(prev =>
  //       prev.map(order =>
  //         order.id === orderId
  //           ? { ...order, status: 'in_progress' as OrderStatus, updatedAt: new Date().toISOString() }
  //           : order
  //       )
  //     );

  //     toast.success('Pedido actualizado', {
  //       description: 'El pedido está ahora en proceso',
  //     });
  //   } catch (error) {
  //     console.error('Error marking order in progress:', error);
  //     toast.error('Error', {
  //       description: 'No se pudo actualizar el pedido',
  //     });
  //     throw error;
  //   }
  // };

  const deleteOrder = async (orderId: string): Promise<void> => {
    // Call service to persist
    // NOTA: El backend libera el stock si el pedido está pending/in_progress
    await ordersService.deleteOrder(orderId);

    // Update local state
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Archived functionality disabled
  // const archiveOrder = async (orderId: string): Promise<void> => {
  //   // Call service to persist
  //   await ordersService.archive(orderId);

  //   // Update local state
  //   setOrders(prev =>
  //     prev.map(order =>
  //       order.id === orderId
  //         ? { ...order, status: 'archived' as OrderStatus, archived: true, archivedAt: new Date().toISOString() }
  //         : order
  //     )
  //   );
  // };

  // const unarchiveOrder = async (orderId: string): Promise<void> => {
  //   // Call service to persist
  //   await ordersService.unarchive(orderId);

  //   // Update local state
  //   setOrders(prev =>
  //     prev.map(order =>
  //       order.id === orderId
  //         ? { ...order, status: 'completed' as OrderStatus, archived: false, archivedAt: undefined }
  //         : order
  //     )
  //   );
  // };

  // Restore functionality disabled
  // const restoreOrder = async (orderId: string): Promise<void> => {
  //   try {
  //     // Call service to restore trashed order
  //     const result = await ordersService.restore(orderId);

  //     // Add restored order to active orders
  //     setOrders(prev => [result.data, ...prev]);

  //     // Remove from history
  //     setHistoryOrders(prev => prev.filter(order => order.id !== orderId));

  //     toast.success('Pedido restaurado', {
  //       description: 'El pedido ha sido restaurado exitosamente',
  //     });
  //   } catch (error) {
  //     console.error('Error restoring order:', error);
  //     toast.error('Error', {
  //       description: 'No se pudo restaurar el pedido',
  //     });
  //     throw error;
  //   }
  // };

  const getOrdersByType = (type: OrderType): Order[] => {
    return orders.filter(order => order.type === type);
  };

  // Archived functionality disabled
  // const getArchivedOrders = (): Order[] => {
  //   return orders.filter(order => order.archived || order.status === 'archived');
  // };

  const getCompletedOrders = (): Order[] => {
    return orders.filter(order =>
      order.status === 'completed' || order.status === 'cancelled'
    );
  };

  const getPendingOrders = (): Order[] => {
    return orders.filter(order => order.status === 'pending');
  };

  // Obtener historial desde el estado (cargado desde backend con filtros)
  const getHistoryOrders = (): Order[] => {
    return historyOrders;
  };

  // Filtrar historial por status específico (desde historyOrders)
  const getOrdersByStatus = (status: OrderStatus): Order[] => {
    return historyOrders.filter(order => order.status === status && !order.deleted_at);
  };

  // Obtener pedidos eliminados (soft deleted)
  const getTrashedOrders = (): Order[] => {
    return historyOrders.filter(order => order.deleted_at);
  };

  const value: OrdersContextType = {
    // Pedidos activos
    orders,
    isLoading,
    refreshOrders,

    // Historial desde backend
    historyOrders,
    isLoadingHistory,
    refreshHistory,

    // Acciones
    addOrder,
    updateOrderStatus,
    // markInProgress, // In-progress functionality disabled
    deleteOrder,
    // archiveOrder, // Archived functionality disabled
    // unarchiveOrder, // Archived functionality disabled
    // restoreOrder, // Restore functionality disabled

    // Filtros
    getOrdersByType,
    // getArchivedOrders, // Archived functionality disabled
    getCompletedOrders,
    getPendingOrders,
    getHistoryOrders,
    getOrdersByStatus,
    getTrashedOrders,
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
