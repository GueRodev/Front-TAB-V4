/**
 * useNotificationsApi Hook
 * React Query hook for managing notifications with API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { transformApiNotificationsToFrontend } from '../utils/transformers';
import type { ApiNotification } from '../types';

const QUERY_KEY = 'notifications';

export const useNotificationsApi = () => {
  const queryClient = useQueryClient();

  // Fetch all notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const response = await notificationService.getAll();
      // Laravel pagination response structure
      const apiNotifications = response.data || [];
      // Transform API data to frontend format
      return transformApiNotificationsToFrontend(apiNotifications as ApiNotification[]);
    },
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 60000, // Consider data stale after 60 seconds
  });

  const notifications = data || [];

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    refreshNotifications: refetch,
  };
};
