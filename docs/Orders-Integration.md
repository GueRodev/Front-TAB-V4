# Integración del Sistema de Órdenes (Orders)

## Tabla de Contenidos
- [Resumen General](#resumen-general)
- [Arquitectura](#arquitectura)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Endpoints de API](#endpoints-de-api)
- [Componentes Frontend](#componentes-frontend)
- [Flujo de Estados de Órdenes](#flujo-de-estados-de-órdenes)
- [Integración con Stock](#integración-con-stock)
- [Archivos del Módulo](#archivos-del-módulo)

---

## Resumen General

Documentación de la integración del sistema de Órdenes entre el frontend React/TypeScript y el backend Laravel, incluyendo:

- ✅ **Gestión completa de órdenes online y en tienda** con Laravel backend
- ✅ **Reserva automática de stock** al crear órdenes
- ✅ **Confirmación de ventas** con descuento de stock real al completar
- ✅ **Liberación de stock** al cancelar o eliminar órdenes
- ✅ **Paginación de órdenes** en vista admin
- ✅ **Historial de órdenes** (completadas, canceladas, eliminadas)
- ✅ **Validación de disponibilidad** antes de crear órdenes
- ✅ **Carrito múltiple** para órdenes en tienda
- ✅ **Eliminación suave (Soft Delete)** de órdenes

---

## Arquitectura

### Stack Tecnológico

**Backend:**
- Laravel 10+
- PostgreSQL
- Sanctum (autenticación)
- OrderService + StockReservationService (manejo automático de stock)

**Frontend:**
- React 18 + TypeScript
- Context API (OrdersContext)
- Hooks personalizados (useOrdersAdmin, useOrderForm, useOrdersHistory)
- Transformers para mapeo Laravel ↔ Frontend

### Estructura de Archivos

```
src/features/orders/
├── components/
│   ├── OrderCard.tsx                    # Tarjeta de orden individual
│   ├── OrdersList.tsx                   # Lista de órdenes activas
│   ├── OrdersTable.tsx                  # Tabla de órdenes (estática)
│   ├── OrdersTableDynamic.tsx           # Tabla con columnas configurables
│   ├── OrderRowDynamic.tsx              # Fila de tabla dinámica
│   ├── ArchivedOrderCard.tsx            # Tarjeta para órdenes archivadas
│   ├── InStoreOrderForm.tsx             # Formulario de orden en tienda
│   ├── ProductSelector.tsx              # Selector de productos para orden
│   ├── AddressSelector.tsx              # Selector de direcciones
│   ├── PaymentMethodSelector.tsx        # Selector de método de pago
│   ├── PaymentConfirmationDialog.tsx    # Confirmación de pago (online)
│   ├── OrderActionDialog.tsx            # Diálogo genérico de acciones
│   ├── OrderStatusBadge.tsx             # Badge de estado de orden
│   ├── OrderColumnSelector.tsx          # Selector de columnas visibles
│   └── ExportButton.tsx                 # Exportar órdenes a Excel/CSV
├── contexts/
│   └── OrdersContext.tsx                # Estado global de órdenes
├── hooks/
│   ├── useOrdersAdmin.ts                # Lógica admin (crear, completar, cancelar)
│   ├── useOrderForm.ts                  # Lógica de formulario de orden online
│   ├── useOrdersHistory.ts              # Lógica de historial
│   └── useOrderColumns.ts               # Configuración de columnas
├── services/
│   └── orders.service.ts                # Llamadas API
├── helpers/
│   ├── order.helpers.ts                 # Utilidades (formateo, cálculos)
│   └── export.helpers.ts                # Exportación de datos
├── utils/
│   └── transformers.ts                  # Laravel ↔ Frontend mapping
├── types/
│   └── order.types.ts                   # DTOs y tipos
└── validations/
    └── order.validation.ts              # Validaciones de formulario
```

---

## Funcionalidades Implementadas

### 1. Tipos de Órdenes

#### Órdenes Online
- Creadas por clientes desde la tienda
- Requieren dirección de entrega
- Opciones: pickup o delivery
- Confirmación de pago antes de completar

#### Órdenes en Tienda (In-Store)
- Creadas por admin/vendedores
- Carrito con múltiples productos
- Información del cliente manual
- Completar directamente tras pago

### 2. Estados de Órdenes

```typescript
type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'archived';
```

**Estados activos:**
- `pending`: Orden creada, stock reservado
- `completed`: Orden finalizada, stock descontado
- `cancelled`: Orden cancelada, stock liberado

**Estados deshabilitados:**
- `in_progress`: Funcionalidad desactivada
- `archived`: Funcionalidad desactivada

### 3. Gestión Automática de Stock

**IMPORTANTE:** El backend maneja el stock automáticamente:

```typescript
// ❌ NO es necesario llamar manualmente a:
// - stockMovementsService.reserveStock()
// - stockMovementsService.confirmSale()
// - stockMovementsService.releaseReservation()

// ✅ El backend lo hace automáticamente al:
// - Crear orden → reserva stock
// - Completar orden → confirma venta y descuenta stock
// - Cancelar orden → libera reserva
// - Eliminar orden pending → libera reserva
```

**Frontend solo usa:**
```typescript
// Validación pre-orden (para UX)
await stockMovementsService.checkAvailability(items);
```

### 4. Carrito Múltiple para In-Store

```typescript
interface InStoreCartItem {
  id: string;
  product_id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

// Agregar productos al carrito
const addToCart = () => { ... };

// Actualizar cantidad
const updateCartItemQuantity = (productId: string, newQuantity: number) => { ... };

// Crear orden con todos los items del carrito
const handleCreateInStoreOrder = async (e: React.FormEvent) => {
  const orderItems = cartItems.map(item => ({ ... }));
  await addOrder({ type: 'in-store', items: orderItems, ... });
};
```

### 5. Paginación de Órdenes

```typescript
// Obtener órdenes paginadas (Admin)
const getAllPaginated = async (filters?: OrderFilters): Promise<PaginatedOrdersResponse> => {
  const endpoint = API_ENDPOINTS.ADMIN_ORDERS;
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.per_page) params.append('per_page', filters.per_page.toString());

  const response = await api.get(endpoint + '?' + params.toString());

  return {
    data: response.data.data.map(transformLaravelOrder),
    pagination: {
      currentPage: response.data.current_page,
      totalPages: response.data.last_page,
      totalItems: response.data.total,
      itemsPerPage: response.data.per_page,
      hasNextPage: response.data.current_page < response.data.last_page,
      hasPreviousPage: response.data.current_page > 1,
    },
  };
};
```

### 6. Historial de Órdenes

```typescript
// Obtener historial (completed + cancelled + trashed)
const getHistory = async (): Promise<Order[]> => {
  const [completed, cancelled, trashed] = await Promise.all([
    getAll(true, { status: 'completed' }),
    getAll(true, { status: 'cancelled' }),
    getTrashed(),
  ]);

  const allHistory = [...completed, ...cancelled, ...trashed];
  return allHistory.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
```

### 7. Transformers Laravel ↔ Frontend

```typescript
// Laravel → Frontend
export const transformLaravelOrder = (laravelOrder: any): Order => {
  return {
    id: String(laravelOrder.id),
    order_number: laravelOrder.order_number,
    user_id: laravelOrder.user_id ? String(laravelOrder.user_id) : undefined,
    type: laravelOrder.order_type,
    status: laravelOrder.status,
    items: laravelOrder.order_items?.map(transformLaravelOrderItem) || [],
    subtotal: Number(laravelOrder.subtotal),
    shipping_cost: Number(laravelOrder.shipping_cost || 0),
    total: Number(laravelOrder.total),
    createdAt: laravelOrder.created_at,
    updatedAt: laravelOrder.updated_at,
    customerInfo: {
      name: laravelOrder.customer_name,
      phone: laravelOrder.customer_phone,
      email: laravelOrder.customer_email || undefined,
    },
    delivery_address: laravelOrder.delivery_address ?
      JSON.parse(laravelOrder.delivery_address) : undefined,
    deliveryOption: laravelOrder.delivery_option,
    paymentMethod: laravelOrder.payment_method,
    notes: laravelOrder.notes,
    deleted_at: laravelOrder.deleted_at,
  };
};

// Frontend → Laravel
export const transformToLaravelOrderPayload = (order: any, type: 'online' | 'in-store'): any => {
  return {
    order_type: type,
    status: order.status,
    customer_name: order.customerInfo.name,
    customer_phone: order.customerInfo.phone,
    customer_email: order.customerInfo.email || null,
    delivery_option: order.deliveryOption,
    delivery_address: order.delivery_address ?
      JSON.stringify(order.delivery_address) : null,
    payment_method: order.paymentMethod,
    notes: order.notes || null,
    items: order.items.map((item: any) => ({
      product_id: Number(item.product_id),
      quantity: item.quantity,
      price: item.price,
    })),
  };
};
```

---

## Endpoints de API

### Endpoints de Cliente

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| GET | `/api/v1/orders` | Listar órdenes del usuario | - |
| POST | `/api/v1/orders` | Crear orden online | Order payload |
| GET | `/api/v1/orders/{id}` | Ver detalle de orden | - |

### Endpoints de Admin

| Método | Endpoint | Descripción | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/v1/admin/orders` | Listar órdenes (paginado) | `?status=X&page=Y&per_page=Z` |
| POST | `/api/v1/admin/orders` | Crear orden en tienda | Order payload |
| GET | `/api/v1/admin/orders/{id}` | Ver detalle de orden | - |
| PATCH | `/api/v1/admin/orders/{id}/complete` | Completar orden | - |
| PATCH | `/api/v1/admin/orders/{id}/cancel` | Cancelar orden | - |
| DELETE | `/api/v1/admin/orders/{id}` | Soft delete orden | - |
| GET | `/api/v1/admin/orders-trashed` | Listar órdenes eliminadas | - |

**Endpoints deshabilitados:**
```typescript
// ❌ PATCH /api/v1/admin/orders/{id}/mark-in-progress  // in_progress disabled
// ❌ POST  /api/v1/admin/orders/{id}/archive           // archive disabled
// ❌ PATCH /api/v1/admin/orders/{id}/restore           // restore disabled
```

### Estructura de Payload

```typescript
// Crear orden online
POST /api/v1/orders
{
  "order_type": "online",
  "status": "pending",
  "customer_name": "Juan Pérez",
  "customer_phone": "88887777",
  "customer_email": "juan@email.com",
  "delivery_option": "delivery",
  "delivery_address": "{\"province\":\"San José\",\"canton\":\"Escazú\",\"district\":\"San Rafael\",\"address\":\"Casa 123\"}",
  "payment_method": "card",
  "notes": "Entregar por la tarde",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 15000
    },
    {
      "product_id": 5,
      "quantity": 1,
      "price": 25000
    }
  ]
}

// Crear orden en tienda
POST /api/v1/admin/orders
{
  "order_type": "in-store",
  "status": "pending",
  "customer_name": "María López",
  "customer_phone": "77776666",
  "customer_email": null,
  "delivery_option": "pickup",
  "delivery_address": null,
  "payment_method": "cash",
  "notes": null,
  "items": [
    {
      "product_id": 3,
      "quantity": 1,
      "price": 35000
    }
  ]
}
```

---

## Componentes Frontend

### OrdersContext - Estado Global

```typescript
interface OrdersContextType {
  // Pedidos activos (pending only)
  orders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;

  // Historial (completed, cancelled, deleted)
  historyOrders: Order[];
  isLoadingHistory: boolean;
  refreshHistory: () => Promise<void>;

  // Acciones
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | ...>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Filtros
  getOrdersByType: (type: OrderType) => Order[];
  getCompletedOrders: () => Order[];
  getPendingOrders: () => Order[];
  getHistoryOrders: () => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getTrashedOrders: () => Order[];
}
```

**Uso:**
```typescript
import { useOrders } from '@/features/orders';

const { orders, addOrder, updateOrderStatus, deleteOrder } = useOrders();
```

### useOrdersAdmin - Lógica Admin

```typescript
const {
  // Datos de órdenes
  onlineOrders,
  inStoreOrders,
  isLoading,

  // Estados de carga
  isCreatingOrder,
  isCompletingOrder,
  isCancellingOrder,
  isDeletingOrder,

  // Carrito in-store
  cartItems,
  cartTotal,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,

  // Selección de producto
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,

  // Info de cliente
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  paymentMethod,
  setPaymentMethod,

  // Filtros de productos
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  activeProducts,
  filteredProducts,

  // Acciones de órdenes
  handleCreateInStoreOrder,
  handleCompleteOrder,
  handleCancelOrder,

  // Diálogos
  deleteOrderDialog,
  openDeleteOrderDialog,
  closeDeleteOrderDialog,
  confirmDeleteOrder,
  paymentConfirmDialog,
  openPaymentConfirmDialog,
  closePaymentConfirmDialog,
  confirmCompleteOrder,
  // ...otros diálogos
} = useOrdersAdmin();
```

### useOrdersHistory - Historial

```typescript
const {
  historyOrders,
  isLoading,
  refreshHistory,
  completedOrders,
  cancelledOrders,
  trashedOrders,
  filterByStatus,
  filterByType,
  filterByDateRange,
} = useOrdersHistory();
```

### OrdersTableDynamic - Tabla Configurable

```tsx
<OrdersTableDynamic
  orders={orders}
  columns={visibleColumns}
  isLoading={isLoading}
  onComplete={handleCompleteOrder}
  onCancel={handleCancelOrder}
  onDelete={handleDeleteOrder}
  onView={handleViewOrder}
/>
```

### InStoreOrderForm - Formulario In-Store

```tsx
<InStoreOrderForm
  cartItems={cartItems}
  cartTotal={cartTotal}
  customerName={customerName}
  customerPhone={customerPhone}
  customerEmail={customerEmail}
  paymentMethod={paymentMethod}
  onCustomerNameChange={setCustomerName}
  onCustomerPhoneChange={setCustomerPhone}
  onCustomerEmailChange={setCustomerEmail}
  onPaymentMethodChange={setPaymentMethod}
  onAddToCart={addToCart}
  onRemoveFromCart={removeFromCart}
  onUpdateQuantity={updateCartItemQuantity}
  onClearCart={clearCart}
  onSubmit={handleCreateInStoreOrder}
  isSubmitting={isCreatingOrder}
/>
```

---

## Flujo de Estados de Órdenes

### Transiciones Válidas

```
pending → completed  ✅
pending → cancelled  ✅
completed → [final] 🔒
cancelled → [final] 🔒
```

**Transiciones deshabilitadas:**
```
❌ pending → in_progress  (funcionalidad desactivada)
❌ in_progress → completed
❌ in_progress → cancelled
❌ * → archived  (funcionalidad desactivada)
```

### Validación de Transiciones

```typescript
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  'pending': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': [],
};

if (!validTransitions[previousStatus]?.includes(newStatus)) {
  toast.error('Transición inválida');
  return;
}
```

---

## Integración con Stock

### Flujo Completo de Stock

```
1. CREAR ORDEN (pending)
   Frontend: checkAvailability() → validación UX
   Backend:  OrderService crea orden
            StockReservationService reserva stock
            Movimiento: tipo='reserva', quantity=+X

2. COMPLETAR ORDEN (completed)
   Frontend: updateOrderStatus(id, 'completed')
   Backend:  StockReservationService confirma venta
            Movimiento: tipo='venta', quantity=-X
            Stock real descontado

3. CANCELAR ORDEN (cancelled)
   Frontend: updateOrderStatus(id, 'cancelled')
   Backend:  StockReservationService libera reserva
            Movimiento: tipo='cancelacion_reserva', quantity=-X

4. ELIMINAR ORDEN (soft delete)
   Frontend: deleteOrder(id)
   Backend:  Si status=pending → libera reserva
            Si status=completed/cancelled → no afecta stock
```

### Verificación Pre-Orden

```typescript
// En OrdersContext.addOrder()
const availability = await stockMovementsService.checkAvailability(items);

if (!availability.available) {
  const errorMessages = availability.errors
    .map(err => `${err.product_name}: solicitado ${err.requested}, disponible ${err.available}`)
    .join(', ');

  toast.error('Stock insuficiente', { description: errorMessages });
  throw new Error('Stock insuficiente para completar el pedido');
}
```

### Actualización de UI tras Operaciones

```typescript
// Después de crear/completar/cancelar/eliminar orden
await refreshProducts(); // Actualiza stock en UI
```

---

## Archivos del Módulo

### Servicios

| Archivo | Descripción |
|---------|-------------|
| [orders.service.ts](src/features/orders/services/orders.service.ts:1) | API calls a Laravel |
| [transformers.ts](src/features/orders/utils/transformers.ts:1) | Mapeo Laravel ↔ Frontend |

### Contextos y Hooks

| Archivo | Descripción |
|---------|-------------|
| [OrdersContext.tsx](src/features/orders/contexts/OrdersContext.tsx:1) | Estado global de órdenes |
| [useOrdersAdmin.ts](src/features/orders/hooks/useOrdersAdmin.ts:1) | Lógica admin completa |
| [useOrderForm.ts](src/features/orders/hooks/useOrderForm.ts:1) | Lógica formulario online |
| [useOrdersHistory.ts](src/features/orders/hooks/useOrdersHistory.ts:1) | Lógica historial |
| [useOrderColumns.ts](src/features/orders/hooks/useOrderColumns.ts:1) | Configuración columnas |

### Componentes Principales

| Archivo | Descripción |
|---------|-------------|
| [OrdersList.tsx](src/features/orders/components/OrdersList.tsx:1) | Lista de tarjetas de órdenes |
| [OrdersTableDynamic.tsx](src/features/orders/components/OrdersTableDynamic.tsx:1) | Tabla configurable |
| [InStoreOrderForm.tsx](src/features/orders/components/InStoreOrderForm.tsx:1) | Formulario in-store |
| [PaymentConfirmationDialog.tsx](src/features/orders/components/PaymentConfirmationDialog.tsx:1) | Confirmación pago online |
| [OrderStatusBadge.tsx](src/features/orders/components/OrderStatusBadge.tsx:1) | Badge de estado |

### Tipos

| Archivo | Descripción |
|---------|-------------|
| [order.types.ts](src/features/orders/types/order.types.ts:1) | Interfaces y types |

---

## Checklist de Pruebas

### Órdenes Online
- [ ] Cliente crea orden desde catálogo
- [ ] Validación de stock antes de crear orden
- [ ] Stock se reserva al crear orden
- [ ] Admin ve orden en lista de pendientes
- [ ] Admin completa orden tras confirmar pago
- [ ] Stock se descuenta al completar
- [ ] Cliente cancela orden pendiente
- [ ] Stock se libera al cancelar

### Órdenes In-Store
- [ ] Admin agrega múltiples productos al carrito
- [ ] Validación de stock por producto
- [ ] Información de cliente obligatoria
- [ ] Orden se crea con todos los items del carrito
- [ ] Stock reservado correctamente
- [ ] Admin completa orden inmediatamente
- [ ] Stock descontado correctamente

### Historial
- [ ] Órdenes completadas aparecen en historial
- [ ] Órdenes canceladas aparecen en historial
- [ ] Órdenes eliminadas aparecen en historial
- [ ] Filtros por estado funcionan
- [ ] Filtros por tipo funcionan
- [ ] Paginación funciona correctamente

### Eliminación
- [ ] Soft delete de orden pendiente libera stock
- [ ] Soft delete de orden completada no afecta stock
- [ ] Órdenes eliminadas aparecen en trashed
- [ ] No se puede restaurar orden (funcionalidad desactivada)

---

## Notas Importantes

1. **Stock Automático**: El backend (OrderService + StockReservationService) maneja TODA la lógica de stock. Frontend solo valida antes de crear.

2. **Estados Deshabilitados**: `in_progress` y `archived` están deshabilitados pero se mantienen en tipos por compatibilidad TypeScript.

3. **Paginación**: Solo disponible en endpoint admin. Cliente ve todas sus órdenes sin paginación.

4. **Transformers**: Siempre usar `transformLaravelOrder()` y `transformToLaravelOrderPayload()` para consistencia.

5. **Refresh de Productos**: Llamar `refreshProducts()` después de operaciones que afecten stock (crear, completar, cancelar, eliminar).

6. **Validación de Transiciones**: El frontend valida transiciones de estado antes de llamar al backend para mejor UX.

7. **Carrito In-Store**: Soporta múltiples productos. Validación de stock individual por producto en el carrito.

8. **Soft Delete**: Las órdenes eliminadas se pueden listar pero NO restaurar (funcionalidad deshabilitada).
