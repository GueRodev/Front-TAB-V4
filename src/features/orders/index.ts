/**
 * Orders Feature Public API
 * Centralized exports for orders feature
 */

// Components
export {
  OrderCard,
  ArchivedOrderCard,
  OrdersList,
  OrdersTable,
  OrderStatusBadge,
  InStoreOrderForm,
  ProductSelector,
  AddressSelector,
  PaymentMethodSelector,
  PaymentConfirmationDialog
} from './components';
export { default as ExportButton } from './components/ExportButton';

// Hooks
export {
  useOrderForm,
  useOrdersAdmin,
  useOrdersHistory
} from './hooks';
export type { HistoryTab } from './hooks/useOrdersHistory';

// Context
export { OrdersProvider, useOrders } from './contexts';

// Services
export { ordersService } from './services';

// Helpers
export * from './helpers';

// Types
export type {
  OrderStatus,
  OrderType,
  DeliveryOption,
  OrderItem,
  DeliveryAddress,
  CustomerInfo,
  Order
} from './types';
