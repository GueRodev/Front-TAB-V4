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
  PaymentConfirmationDialog,
  OrderActionDialog,
  type OrderActionType
} from './components';
export { default as ExportButton } from './components/ExportButton';
export { OrdersTableDynamic } from './components/OrdersTableDynamic';
export { OrderColumnSelector } from './components/OrderColumnSelector';
export { OrderRowDynamic } from './components/OrderRowDynamic';

// Hooks
export {
  useOrderForm,
  useOrdersAdmin,
  useOrdersHistory
} from './hooks';
export { useOrderColumns, ORDER_COLUMNS } from './hooks/useOrderColumns';
export type { HistoryTab } from './hooks/useOrdersHistory';
export type { OrderColumn } from './hooks/useOrderColumns';

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
