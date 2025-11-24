/**
 * Orders History Business Logic Hook
 * Manages completed/cancelled/archived/deleted orders with filters and exports
 * Usa datos del backend a través de OrdersContext
 */

import { useState, useMemo, useEffect } from 'react';
import { useOrders } from '../contexts';
import { exportOrdersToPDF, exportOrdersToExcel } from '../helpers';
import type { Order, OrderType } from '../types';

export type HistoryTab = 'all' | 'completed' | 'cancelled' | 'pending' | 'deleted';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface UseOrdersHistoryReturn {
  // Datos
  completedOrders: Order[]; // Mantener para compatibilidad
  filteredOrders: Order[];
  isLoading: boolean;

  // Tabs
  activeTab: HistoryTab;
  setActiveTab: (tab: HistoryTab) => void;

  // Contadores por tab
  counts: {
    all: number;
    completed: number;
    cancelled: number;
    pending: number;
    deleted: number;
  };

  // Filtros
  typeFilter: OrderType | 'all';
  setTypeFilter: (type: OrderType | 'all') => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Exportación
  handleExportPDF: () => void;
  handleExportExcel: () => void;

  // Acciones de pedidos
  handleDeleteOrder: (orderId: string) => Promise<void>;

  // Utilidades
  clearFilters: () => void;
  hasActiveFilters: boolean;
  refreshHistory: () => Promise<void>;
  restoreOrder: (orderId: string) => Promise<void>;
}

export const useOrdersHistory = (): UseOrdersHistoryReturn => {
  const {
    historyOrders,
    isLoadingHistory,
    refreshHistory,
    getOrdersByStatus,
    getCompletedOrders,
    getPendingOrders,
    getTrashedOrders,
    restoreOrder,
    deleteOrder,
  } = useOrders();

  // Cargar historial cuando se monta el hook
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Estado de tabs
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');

  // Estado de filtros
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [searchQuery, setSearchQuery] = useState('');

  // Usar historyOrders directamente del contexto (cargado desde backend)
  const allHistoryOrders = historyOrders;

  // Mantener compatibilidad con código existente
  const completedOrders = getCompletedOrders();

  // Contadores por tab
  const counts = useMemo(() => ({
    all: allHistoryOrders.length,
    completed: getOrdersByStatus('completed').length,
    cancelled: getOrdersByStatus('cancelled').length,
    pending: getPendingOrders().length,
    deleted: getTrashedOrders().length,
  }), [allHistoryOrders, getOrdersByStatus, getPendingOrders, getTrashedOrders]);

  // Filtrar pedidos según tab activo y filtros adicionales
  const filteredOrders = useMemo(() => {
    // Primero filtrar por tab
    let orders: Order[];
    switch (activeTab) {
      case 'completed':
        orders = getOrdersByStatus('completed');
        break;
      case 'cancelled':
        orders = getOrdersByStatus('cancelled');
        break;
      case 'pending':
        orders = getPendingOrders();
        break;
      case 'deleted':
        orders = getTrashedOrders();
        break;
      default:
        orders = allHistoryOrders;
    }

    // Filtrar por tipo de pedido
    if (typeFilter !== 'all') {
      orders = orders.filter(order => order.type === typeFilter);
    }

    // Filtrar por rango de fechas
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= toDate;
      });
    }

    // Filtrar por búsqueda (nombre cliente, teléfono, número de orden)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      orders = orders.filter(order =>
        order.customerInfo?.name?.toLowerCase().includes(query) ||
        order.customerInfo?.phone?.includes(query) ||
        order.order_number?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }

    // Ordenar por fecha (más recientes primero)
    return orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, allHistoryOrders, getOrdersByStatus, getPendingOrders, getTrashedOrders, typeFilter, dateRange, searchQuery]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return typeFilter !== 'all' ||
           dateRange.from !== null ||
           dateRange.to !== null ||
           searchQuery.trim() !== '';
  }, [typeFilter, dateRange, searchQuery]);

  // Limpiar todos los filtros
  const clearFilters = () => {
    setTypeFilter('all');
    setDateRange({ from: null, to: null });
    setSearchQuery('');
  };

  const handleExportPDF = () => {
    exportOrdersToPDF(filteredOrders);
  };

  const handleExportExcel = () => {
    exportOrdersToExcel(filteredOrders);
  };

  // Acciones de pedidos
  const handleDeleteOrder = async (orderId: string) => {
    await deleteOrder(orderId);
    await refreshHistory();
  };

  return {
    // Datos
    completedOrders,
    filteredOrders,
    isLoading: isLoadingHistory,

    // Tabs
    activeTab,
    setActiveTab,

    // Contadores
    counts,

    // Filtros
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,

    // Exportación
    handleExportPDF,
    handleExportExcel,

    // Acciones de pedidos
    handleDeleteOrder,

    // Utilidades
    clearFilters,
    refreshHistory,
    hasActiveFilters,
    restoreOrder,
  };
};
