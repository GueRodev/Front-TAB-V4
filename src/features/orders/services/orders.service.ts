/**
 * Orders Service
 * Fully integrated with Laravel backend
 */

import type { Order, OrderStatus, OrderType } from '../types';
import type { ApiResponse } from '@/api/types';
import { api, API_ENDPOINTS } from '@/api';
import { transformLaravelOrder, transformToLaravelOrderPayload } from '../utils/transformers';

/**
 * Interfaz para filtros de búsqueda de pedidos
 */
interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  order_type?: OrderType;
  page?: number;
  per_page?: number;
}

/**
 * Respuesta paginada de pedidos
 */
export interface PaginatedOrdersResponse {
  data: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Helper para extraer datos de diferentes estructuras de respuesta
 */
const extractOrdersData = (responseData: any): any[] => {
  if (Array.isArray(responseData)) {
    return responseData;
  } else if (responseData?.data) {
    if (Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (responseData.data?.data && Array.isArray(responseData.data.data)) {
      return responseData.data.data;
    }
  }
  console.warn('Unexpected orders response structure:', responseData);
  return [];
};

/**
 * Get all orders with optional filters
 * 🔗 LARAVEL: GET /api/admin/orders (Admin) or GET /api/orders (Client)
 */
const getAll = async (isAdmin: boolean = false, filters?: OrderFilters): Promise<Order[]> => {
  const endpoint = isAdmin ? API_ENDPOINTS.ADMIN_ORDERS : API_ENDPOINTS.ORDERS;

  // Build query params
  const params = new URLSearchParams();
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      // Para múltiples status, hacemos múltiples llamadas o usamos el primero
      // El backend no soporta múltiples status en una llamada, así que ignoramos arrays aquí
      params.append('status', filters.status[0]);
    } else {
      params.append('status', filters.status);
    }
  }
  if (filters?.order_type) {
    params.append('order_type', filters.order_type);
  }
  if (filters?.per_page) {
    params.append('per_page', filters.per_page.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const response = await api.get<any>(url);
  const ordersData = extractOrdersData(response.data);
  return ordersData.map(transformLaravelOrder);
};

/**
 * Get all orders with pagination
 * 🔗 LARAVEL: GET /api/admin/orders?status=X&page=Y&per_page=Z
 */
const getAllPaginated = async (filters?: OrderFilters): Promise<PaginatedOrdersResponse> => {
  const endpoint = API_ENDPOINTS.ADMIN_ORDERS;

  // Build query params
  const params = new URLSearchParams();
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      params.append('status', filters.status[0]);
    } else {
      params.append('status', filters.status);
    }
  }
  if (filters?.order_type) {
    params.append('order_type', filters.order_type);
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.per_page) {
    params.append('per_page', filters.per_page.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const response = await api.get<any>(url);

  // Extraer datos y paginación de la respuesta de Laravel
  const responseData = response.data?.data || response.data;
  const ordersData = responseData?.data || responseData || [];
  const laravelPagination = responseData;

  // Transformar la paginación de Laravel al formato del frontend
  const pagination = {
    currentPage: laravelPagination?.current_page || 1,
    totalPages: laravelPagination?.last_page || 1,
    totalItems: laravelPagination?.total || ordersData.length,
    itemsPerPage: laravelPagination?.per_page || 15,
    hasNextPage: laravelPagination?.current_page < laravelPagination?.last_page,
    hasPreviousPage: laravelPagination?.current_page > 1,
  };

  return {
    data: Array.isArray(ordersData) ? ordersData.map(transformLaravelOrder) : [],
    pagination,
  };
};

/**
 * Get trashed (soft deleted) orders
 * 🔗 LARAVEL: GET /api/admin/orders-trashed
 */
const getTrashed = async (): Promise<Order[]> => {
  try {
    const response = await api.get<any>(API_ENDPOINTS.ADMIN_ORDERS_TRASHED);
    const ordersData = extractOrdersData(response.data);
    return ordersData.map(transformLaravelOrder);
  } catch (error) {
    console.error('Error fetching trashed orders:', error);
    return [];
  }
};

/**
 * Restore a trashed order
 * 🔗 LARAVEL: PATCH /api/admin/orders/{id}/restore
 * DISABLED: Restore functionality not needed
 */
// const restore = async (id: string): Promise<ApiResponse<Order>> => {
//   const response = await api.patch<ApiResponse<any>>(API_ENDPOINTS.ADMIN_ORDER_RESTORE(id));
//   return {
//     ...response.data,
//     data: transformLaravelOrder(response.data.data),
//   };
// };

/**
 * Get orders for history (completed, cancelled, deleted)
 * 🔗 LARAVEL: Multiple calls to GET /api/admin/orders?status=X + /api/admin/orders-trashed
 */
const getHistory = async (): Promise<Order[]> => {
  try {
    // Hacer llamadas paralelas para cada status del historial + eliminados
    const [completed, cancelled, trashed] = await Promise.all([
      getAll(true, { status: 'completed' }),
      getAll(true, { status: 'cancelled' }),
      getTrashed(),
    ]);

    // Combinar y ordenar por fecha (más recientes primero)
    const allHistory = [...completed, ...cancelled, ...trashed];
    return allHistory.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching order history:', error);
    return [];
  }
};

/**
 * Get orders by specific status
 * 🔗 LARAVEL: GET /api/admin/orders?status=X
 */
const getByStatus = async (status: OrderStatus): Promise<Order[]> => {
  return getAll(true, { status });
};

const getById = async (id: string): Promise<Order | null> => {
  const orders = await getAll();
  return orders.find(order => order.id === id) || null;
};

const getByType = async (type: OrderType): Promise<Order[]> => {
  const orders = await getAll();
  return orders.filter(order => order.type === type);
};

// Archived functionality disabled
// const getArchived = async (): Promise<Order[]> => {
//   return getByStatus('archived');
// };

const createOnlineOrder = async (data: Omit<Order, 'id' | 'createdAt' | 'order_number'>): Promise<ApiResponse<Order>> => {
  // Transform frontend format to Laravel API format
  const payload = transformToLaravelOrderPayload(data, 'online');
  const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.ORDERS, payload);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const createInStoreOrder = async (data: Omit<Order, 'id' | 'createdAt' | 'order_number'>): Promise<ApiResponse<Order>> => {
  // Transform frontend format to Laravel API format
  const payload = transformToLaravelOrderPayload(data, 'in-store');
  const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN_ORDERS, payload);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const create = async (data: Omit<Order, 'id' | 'createdAt' | 'order_number'>): Promise<ApiResponse<Order>> => {
  return data.type === 'online' ? createOnlineOrder(data) : createInStoreOrder(data);
};

// In-progress functionality disabled
// const markInProgress = async (id: string): Promise<ApiResponse<Order>> => {
//   const response = await api.patch<ApiResponse<any>>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/mark-in-progress`);
//   return {
//     ...response.data,
//     data: transformLaravelOrder(response.data.data),
//   };
// };

const updateStatus = async (id: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
  let endpoint = `${API_ENDPOINTS.ADMIN_ORDERS}/${id}`;
  if (status === 'completed') endpoint += '/complete';
  else if (status === 'cancelled') endpoint += '/cancel';
  else throw new Error('Invalid status for update');

  const response = await api.patch<ApiResponse<any>>(endpoint);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

// Archived functionality disabled
// const archive = async (id: string): Promise<ApiResponse<Order>> => {
//   const response = await api.post<ApiResponse<any>>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/archive`);
//   return {
//     ...response.data,
//     data: transformLaravelOrder(response.data.data),
//   };
// };

// const unarchive = async (id: string): Promise<ApiResponse<Order>> => {
//   const response = await api.patch<ApiResponse<any>>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/unarchive`);
//   return {
//     ...response.data,
//     data: transformLaravelOrder(response.data.data),
//   };
// };

const deleteOrder = async (id: string): Promise<ApiResponse<void>> => {
  await api.delete(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}`);
  return {
    data: undefined,
    message: 'Order deleted successfully',
    timestamp: new Date().toISOString(),
  };
};

export const ordersService = {
  getAll,
  getAllPaginated,
  getById,
  getByType,
  // getArchived, // Archived functionality disabled
  getHistory,
  getByStatus,
  getTrashed,
  create,
  createOnlineOrder,
  createInStoreOrder,
  // markInProgress, // In-progress functionality disabled
  updateStatus,
  // archive, // Archived functionality disabled
  // unarchive, // Archived functionality disabled
  // restore, // Restore functionality disabled
  deleteOrder,
};
