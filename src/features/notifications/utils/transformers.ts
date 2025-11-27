/**
 * Notification Transformers
 * Transforms data between API and Frontend formats
 */

import type { ApiNotification, Notification } from '../types';

/**
 * Transform Laravel API notification to Frontend format
 */
export const transformApiNotificationToFrontend = (apiNotification: ApiNotification): Notification => {
  return {
    id: apiNotification.id.toString(),
    type: apiNotification.type,
    title: apiNotification.title,
    message: apiNotification.message,
    time: formatNotificationTime(apiNotification.created_at),
    read: !!apiNotification.read_at,
    createdAt: new Date(apiNotification.created_at),
    orderId: apiNotification.data?.order_id?.toString(),
    link: apiNotification.data?.link,
  };
};

/**
 * Transform array of API notifications to Frontend format
 */
export const transformApiNotificationsToFrontend = (apiNotifications: ApiNotification[]): Notification[] => {
  return apiNotifications.map(transformApiNotificationToFrontend);
};

/**
 * Format notification timestamp to relative time
 */
function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Hace un momento';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} sem`;
  }

  return date.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
