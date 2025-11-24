/**
 * Orders History Business Logic Hook
 * Manages completed/cancelled/pending/deleted orders with filters, pagination and exports
 * Usa datos del backend con paginación del servidor
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOrders } from '../contexts';
import { ordersService } from '../services';
import { exportOrdersToPDF, exportOrdersToExcel } from '../helpers';
import type { Order, OrderType, OrderStatus } from '../types';

export type HistoryTab = 'all' | 'completed' | 'cancelled' | 'pending' | 'deleted';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const defaultPagination: PaginationInfo = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 15,
  hasNextPage: false,
  hasPreviousPage: false,
};

interface UseOrdersHistoryReturn {
  // Datos
  completedOrders: Order[]; // Mantener para compatibilidad
  filteredOrders: Order[];
  isLoading: boolean;

  // Paginación
  pagination: PaginationInfo;
  goToPage: (page: number) => void;

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
    getCompletedOrders,
    restoreOrder,
    deleteOrder,
    orders, // Pedidos activos para pending
  } = useOrders();

  // Estado de datos paginados
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(defaultPagination);
  const [isLoading, setIsLoading] = useState(false);

  // Estado de tabs
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');

  // Estado de filtros
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [searchQuery, setSearchQuery] = useState('');

  // Contadores por tab (se cargan una vez)
  const [counts, setCounts] = useState({
    all: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    deleted: 0,
  });

  // Mapear tab a status del backend
  const getStatusForTab = (tab: HistoryTab): OrderStatus | undefined => {
    switch (tab) {
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'pending': return 'pending';
      default: return undefined;
    }
  };

  // Cargar pedidos paginados del backend
  const loadOrders = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      if (activeTab === 'deleted') {
        // Los eliminados usan endpoint especial sin paginación
        const trashedOrders = await ordersService.getTrashed();
        setPaginatedOrders(trashedOrders);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: trashedOrders.length,
          itemsPerPage: trashedOrders.length,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      } else if (activeTab === 'pending') {
        // Los pending vienen de orders activos (no del historial)
        const pendingOrders = orders.filter(o => o.status === 'pending');
        setPaginatedOrders(pendingOrders);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: pendingOrders.length,
          itemsPerPage: pendingOrders.length,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      } else {
        // Tabs con paginación del servidor (all, completed, cancelled)
        const status = getStatusForTab(activeTab);
        const response = await ordersService.getAllPaginated({
          status,
          page,
          per_page: 15,
        });
        setPaginatedOrders(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setPaginatedOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, orders]);

  // Cargar contadores iniciales
  const loadCounts = useCallback(async () => {
    try {
      const [completedRes, cancelledRes, trashedOrders] = await Promise.all([
        ordersService.getAllPaginated({ status: 'completed', per_page: 1 }),
        ordersService.getAllPaginated({ status: 'cancelled', per_page: 1 }),
        ordersService.getTrashed(),
      ]);

      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const allCount = completedRes.pagination.totalItems + cancelledRes.pagination.totalItems;

      setCounts({
        all: allCount,
        completed: completedRes.pagination.totalItems,
        cancelled: cancelledRes.pagination.totalItems,
        pending: pendingCount,
        deleted: trashedOrders.length,
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  }, [orders]);

  // Cargar datos cuando cambia el tab o la página
  useEffect(() => {
    loadOrders(1);
  }, [activeTab]);

  // Cargar contadores al montar
  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Cambiar de página
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    loadOrders(page);
  };

  // Refrescar historial
  const refreshHistory = async () => {
    await loadOrders(pagination.currentPage);
    await loadCounts();
  };

  // Mantener compatibilidad con código existente
  const completedOrders = getCompletedOrders();

  // Filtrar pedidos client-side (búsqueda, tipo, fechas)
  const filteredOrders = useMemo(() => {
    let filtered = paginatedOrders;

    // Filtrar por tipo de pedido
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    // Filtrar por rango de fechas
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= toDate;
      });
    }

    // Filtrar por búsqueda (nombre cliente, teléfono, número de orden)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order =>
        order.customerInfo?.name?.toLowerCase().includes(query) ||
        order.customerInfo?.phone?.includes(query) ||
        order.order_number?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [paginatedOrders, typeFilter, dateRange, searchQuery]);

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

  // Handler para cambiar tab (resetea a página 1)
  const handleSetActiveTab = (tab: HistoryTab) => {
    setActiveTab(tab);
  };

  return {
    // Datos
    completedOrders,
    filteredOrders,
    isLoading,

    // Paginación
    pagination,
    goToPage,

    // Tabs
    activeTab,
    setActiveTab: handleSetActiveTab,

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
