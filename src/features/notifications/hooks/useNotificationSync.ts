/**
 * useNotificationSync Hook
 * Syncs data when new notifications arrive
 */

import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts';

interface UseNotificationSyncOptions {
  onOrderNotification?: () => void;
  onUserNotification?: () => void;
  onProductNotification?: () => void;
}

/**
 * Hook to trigger actions when new notifications of specific types arrive
 */
export const useNotificationSync = (options: UseNotificationSyncOptions) => {
  const { notifications } = useNotifications();
  const previousCountRef = useRef<Record<string, number>>({
    order: 0,
    user: 0,
    product: 0,
  });

  useEffect(() => {
    // Count current notifications by type
    const currentCounts = {
      order: notifications.filter(n => n.type === 'order' && !n.read).length,
      user: notifications.filter(n => n.type === 'user' && !n.read).length,
      product: notifications.filter(n => n.type === 'product' && !n.read).length,
    };

    // Check if we have new order notifications
    if (currentCounts.order > previousCountRef.current.order && options.onOrderNotification) {
      options.onOrderNotification();
    }

    // Check if we have new user notifications
    if (currentCounts.user > previousCountRef.current.user && options.onUserNotification) {
      options.onUserNotification();
    }

    // Check if we have new product notifications
    if (currentCounts.product > previousCountRef.current.product && options.onProductNotification) {
      options.onProductNotification();
    }

    // Update previous counts
    previousCountRef.current = currentCounts;
  }, [notifications, options]);
};
