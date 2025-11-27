/**
 * Notification Validation Schemas
 * Zod schemas for notification data validation
 */

import { z } from 'zod';

/**
 * Notification Type Schema
 */
export const notificationTypeSchema = z.enum(['order', 'user', 'product', 'stock', 'general']);

/**
 * Notification Data Schema (from API)
 */
export const notificationDataSchema = z.object({
  order_id: z.number().optional(),
  product_id: z.number().optional(),
  user_id: z.number().optional(),
  stock: z.number().optional(),
  email: z.string().email().optional(),
  link: z.string().optional(),
}).nullable();

/**
 * API Notification Schema
 */
export const apiNotificationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: notificationTypeSchema,
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  data: notificationDataSchema,
  read_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

/**
 * Frontend Notification Schema
 */
export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  time: z.string(),
  read: z.boolean(),
  createdAt: z.date(),
  orderId: z.string().optional(),
  link: z.string().optional(),
});

/**
 * API Pagination Meta Schema
 */
export const apiPaginationMetaSchema = z.object({
  current_page: z.number(),
  from: z.number().nullable(),
  last_page: z.number(),
  path: z.string(),
  per_page: z.number(),
  to: z.number().nullable(),
  total: z.number(),
});

/**
 * API Pagination Links Schema
 */
export const apiPaginationLinksSchema = z.object({
  first: z.string().nullable(),
  last: z.string().nullable(),
  prev: z.string().nullable(),
  next: z.string().nullable(),
});

/**
 * API Notifications Response Schema
 */
export const apiNotificationsResponseSchema = z.object({
  data: z.array(apiNotificationSchema),
  links: apiPaginationLinksSchema,
  meta: apiPaginationMetaSchema,
});

/**
 * API Unread Count Response Schema
 */
export const apiUnreadCountResponseSchema = z.object({
  count: z.number().min(0),
});

/**
 * Validate API notification response
 */
export const validateApiNotification = (data: unknown) => {
  return apiNotificationSchema.parse(data);
};

/**
 * Validate array of API notifications
 */
export const validateApiNotifications = (data: unknown) => {
  return z.array(apiNotificationSchema).parse(data);
};

/**
 * Validate API notifications paginated response
 */
export const validateApiNotificationsResponse = (data: unknown) => {
  return apiNotificationsResponseSchema.parse(data);
};

/**
 * Validate unread count response
 */
export const validateUnreadCountResponse = (data: unknown) => {
  return apiUnreadCountResponseSchema.parse(data);
};
