/**
 * Notification Types
 * Centralized types for notification system
 */

// ========================================
// FRONTEND TYPES
// ========================================

// Solo utilizamos 'order' por el momento - los demás tipos están comentados
export type NotificationType = 'order' | 'user' | 'product' | 'stock' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: Date;
  orderId?: string; // Solo se usa para notificaciones de pedidos
  link?: string;
}

// ========================================
// API RESPONSE TYPES (Laravel Backend)
// ========================================

/**
 * Notification from Laravel API
 */
export interface ApiNotification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    order_id?: number; // Solo se usa para notificaciones de pedidos
    // Los siguientes campos están comentados ya que no se usan por el momento
    product_id?: number;
    user_id?: number;
    stock?: number;
    email?: string;
    link?: string;
  } | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // No se usa soft delete por el momento
}

/**
 * Laravel Pagination Meta
 */
export interface ApiPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Laravel Pagination Links
 */
export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/**
 * Complete Laravel Pagination Response for Notifications
 */
export interface ApiNotificationsResponse {
  data: ApiNotification[];
  links: ApiPaginationLinks;
  meta: ApiPaginationMeta;
}

/**
 * API Response for Unread Count
 */
export interface ApiUnreadCountResponse {
  count: number;
}

/**
 * API Response for Mark as Read
 */
export interface ApiMarkAsReadResponse {
  message: string;
  data: ApiNotification;
}

/**
 * API Response for Mark All as Read
 */
export interface ApiMarkAllAsReadResponse {
  message: string;
}

/**
 * API Response for Delete Notification
 */
export interface ApiDeleteNotificationResponse {
  message: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
