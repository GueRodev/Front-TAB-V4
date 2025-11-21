/**
 * API Configuration Constants
 * Simplified centralized API configuration
 */

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: "/v1/auth/register",
  AUTH_LOGIN: "/v1/auth/login",
  AUTH_LOGOUT: "/v1/auth/logout",
  AUTH_LOGOUT_ALL: "/v1/auth/logout-all",
  AUTH_ME: "/v1/auth/me",

  // Profile
  PROFILE: "/v1/profile", //GET, PUT

  // Products
  PRODUCTS: "/v1/products",
  PRODUCTS_FEATURED: "/v1/products/featured",
  PRODUCTS_RECYCLE_BIN: "/v1/products/recycle-bin",
  PRODUCT_DETAIL: (id: string | number) => `/v1/products/${id}`,
  PRODUCT_STOCK: (id: string | number) => `/v1/products/${id}/stock`,
  PRODUCT_STOCK_MOVEMENTS: (id: string | number) => `/v1/products/${id}/stock-movements`,
  PRODUCT_FEATURED: (id: string | number) => `/v1/products/${id}/featured`,
  PRODUCT_RESTORE: (id: string | number) => `/v1/products/${id}/restore`,
  PRODUCT_FORCE_DELETE: (id: string | number) => `/v1/products/${id}/force`,

  // Categories
  CATEGORIES: "/v1/categories",
  CATEGORY_DETAIL: (id: string | number) => `/v1/categories/${id}`,
  CATEGORIES_REORDER: "/v1/categories/reorder",
  CATEGORIES_RECYCLE_BIN: "/v1/categories/recycle-bin",
  CATEGORY_RESTORE: (id: string | number) => `/v1/categories/${id}/restore`,
  CATEGORY_FORCE_DELETE: (id: string | number) => `/v1/categories/${id}/force`,

  // Orders - Client
  ORDERS: "/v1/orders",
  ORDER_DETAIL: (id: string | number) => `/v1/orders/${id}`,

  // Orders - Admin
  ADMIN_ORDERS: "/v1/admin/orders",
  ADMIN_ORDER_DETAIL: (id: string | number) => `/v1/admin/orders/${id}`,
  ADMIN_ORDER_MARK_IN_PROGRESS: (id: string | number) => `/v1/admin/orders/${id}/mark-in-progress`,
  ADMIN_ORDER_COMPLETE: (id: string | number) => `/v1/admin/orders/${id}/complete`,
  ADMIN_ORDER_CANCEL: (id: string | number) => `/v1/admin/orders/${id}/cancel`,
  ADMIN_ORDER_ARCHIVE: (id: string | number) => `/v1/admin/orders/${id}/archive`,

  // Addresses - Client
  ADDRESSES: "/v1/addresses",
  ADDRESS_DETAIL: (id: string | number) => `/v1/addresses/${id}`,
  ADDRESS_SET_DEFAULT: (id: string | number) => `/v1/addresses/${id}/set-default`,

  // Addresses - Admin
  ADMIN_ADDRESSES: "/v1/admin/addresses",
  ADMIN_ADDRESS_DETAIL: (id: string | number) => `/v1/admin/addresses/${id}`,
  ADMIN_USER_ADDRESSES: (userId: string | number) => `/v1/admin/users/${userId}/addresses`,

  // Users - Admin
  USERS: "/v1/users",
  USER_DETAIL: (id: string | number) => `/v1/users/${id}`,

  // Locations
  LOCATIONS_CR: "/v1/locations/cr",

  // Test (Development only)
  TEST_EMAIL: "/test-email",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",

  // Data storage (legacy lowercase names for compatibility)
  cart: "cart",
  wishlist: "wishlist",
  products: "products",
  categories: "categories",
  orders: "orders",
  notifications: "notifications",
  user: "user",
  hidden_order_ids: "hidden_order_ids",

  // New uppercase names (for consistency)
  CART_ITEMS: "cart_items",
  WISHLIST_ITEMS: "wishlist_items",
  HIDDEN_ORDER_IDS: "hidden_order_ids",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
} as const;
