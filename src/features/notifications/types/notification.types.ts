/**
 * Notification-related types
 * Centralized types for notification system
 */

export type NotificationType = 'order' | 'user' | 'product' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: Date;
  orderId?: string; // Order ID for redirection
  link?: string; // Optional custom redirection URL
}
