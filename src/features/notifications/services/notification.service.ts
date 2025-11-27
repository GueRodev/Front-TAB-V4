/**
 * Notification Service
 * Handles all notification-related API calls
 */

import api from '@/api/apiService';
import { API_ENDPOINTS } from '@/api/constants';

export const notificationService = {
  /**
   * Get all notifications for the authenticated user
   * @param perPage - Number of notifications per page (default: 50)
   */
  getAll: async (perPage = 50) => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS, {
      params: { per_page: perPage },
    });
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async () => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
    return response.data;
  },

  /**
   * Mark a specific notification as read
   * @param id - Notification ID
   */
  markAsRead: async (id: string | number) => {
    const response = await api.put(API_ENDPOINTS.NOTIFICATION_READ(id));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
    return response.data;
  },

  /**
   * Delete a specific notification
   * @param id - Notification ID
   */
  delete: async (id: string | number) => {
    const response = await api.delete(API_ENDPOINTS.NOTIFICATION_DELETE(id));
    return response.data;
  },
};
