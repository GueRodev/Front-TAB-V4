/**
 * Notifications Context
 * Manages admin notifications using API backend
 */

import React, { createContext, useContext } from 'react';
import type { Notification } from '../types';
import { useNotificationsApi } from '../hooks/useNotificationsApi';

// Re-export types for backward compatibility
export type { Notification, NotificationType } from '../types';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  forceDeleteNotification: (id: string) => void;
  isLoading: boolean;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    forceDeleteNotification,
    isLoading,
    refreshNotifications,
  } = useNotificationsApi();

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        forceDeleteNotification,
        isLoading,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};
