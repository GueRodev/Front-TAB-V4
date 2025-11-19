/**
 * Orders Service
 * Fully integrated with Laravel backend
 */

import type { Order, OrderStatus, OrderType } from '../types';
import type { ApiResponse } from '@/api/types';
import { STORAGE_KEYS, api, API_ENDPOINTS } from '@/api';
import { transformLaravelOrder } from '../utils/transformers';

/**
 * Get all orders
 * 🔗 LARAVEL: GET /api/admin/orders (Admin) or GET /api/orders (Client)
 */
const getAll = async (): Promise<Order[]> => {
  const isAdmin = true;
  const endpoint = isAdmin ? API_ENDPOINTS.ADMIN_ORDERS : API_ENDPOINTS.ORDERS;
  const response = await api.get<ApiResponse<any[]>>(endpoint);
  return response.data.data.map(transformLaravelOrder);
};

const getById = async (id: string): Promise<Order | null> => {
  const orders = await getAll();
  return orders.find(order => order.id === id) || null;
};

const getByType = async (type: OrderType): Promise<Order[]> => {
  const orders = await getAll();
  return orders.filter(order => order.type === type && !order.archived);
};

const getArchived = async (): Promise<Order[]> => {
  const response = await api.get<ApiResponse<any[]>>(`${API_ENDPOINTS.ADMIN_ORDERS}?status=archived`);
  return response.data.data.map(transformLaravelOrder);
};

const createOnlineOrder = async (data: Omit<Order, 'id' | 'createdAt' | 'order_number'>): Promise<ApiResponse<Order>> => {
  const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.ORDERS, data);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const createInStoreOrder = async (data: Omit<Order, 'id' | 'createdAt' | 'order_number'>): Promise<ApiResponse<Order>> => {
  const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN_ORDERS, data);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const create = async (data: Omit<Order, 'id' | 'createdAt' | 'order_number'>): Promise<ApiResponse<Order>> => {
  return data.type === 'online' ? createOnlineOrder(data) : createInStoreOrder(data);
};

const markInProgress = async (id: string): Promise<ApiResponse<Order>> => {
  const response = await api.put<ApiResponse<any>>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/mark-in-progress`);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const updateStatus = async (id: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
  let endpoint = `${API_ENDPOINTS.ADMIN_ORDERS}/${id}`;
  if (status === 'completed') endpoint += '/complete';
  else if (status === 'cancelled') endpoint += '/cancel';
  else throw new Error('Invalid status for update');

  const response = await api.put<ApiResponse<any>>(endpoint);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const archive = async (id: string): Promise<ApiResponse<Order>> => {
  const response = await api.put<ApiResponse<any>>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/archive`);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

const unarchive = async (id: string): Promise<ApiResponse<Order>> => {
  const response = await api.put<ApiResponse<any>>(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}/unarchive`);
  return {
    ...response.data,
    data: transformLaravelOrder(response.data.data),
  };
};

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
  getById,
  getByType,
  getArchived,
  create,
  createOnlineOrder,
  createInStoreOrder,
  markInProgress,
  updateStatus,
  archive,
  unarchive,
  deleteOrder,
};
