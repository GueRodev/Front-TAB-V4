# Integración del Sistema de Movimientos de Stock (Stock Movement)

## Tabla de Contenidos
- [Resumen General](#resumen-general)
- [Arquitectura](#arquitectura)
- [Tipos de Movimientos](#tipos-de-movimientos)
- [Endpoints de API](#endpoints-de-api)
- [Funcionalidades](#funcionalidades)
- [Integración con Órdenes](#integración-con-órdenes)
- [Trazabilidad Completa](#trazabilidad-completa)
- [Archivos del Módulo](#archivos-del-módulo)

---

## Resumen General

Documentación del sistema de Movimientos de Stock que proporciona **trazabilidad completa** del inventario, incluyendo:

- ✅ **Registro automático** de todos los movimientos de stock
- ✅ **6 tipos de movimientos** (entrada, salida, ajuste, reserva, venta, cancelación)
- ✅ **Stock antes/después** en cada movimiento
- ✅ **Integración automática con órdenes** vía backend
- ✅ **Verificación de disponibilidad** pre-orden
- ✅ **Ajustes manuales de stock** (entrada/salida/ajuste)
- ✅ **Historial de movimientos** por producto
- ✅ **Auditoría completa** con usuario y timestamp

---

## Arquitectura

### Stack Tecnológico

**Backend:**
- Laravel 10+
- PostgreSQL (tabla `stock_movements`)
- OrderService (gestión de órdenes)
- StockReservationService (gestión automática de stock)
- Eventos y observers para trazabilidad

**Frontend:**
- React 18 + TypeScript
- Servicio especializado: `stockMovementsService`
- Transformers para mapeo de datos
- Componente `StockMovementHistory` para visualización

### Modelo de Datos

```typescript
interface StockMovement {
  id: string;                          // ID del movimiento
  product_id: string;                  // ID del producto
  type: StockMovementType;             // Tipo de movimiento
  quantity: number;                    // Cantidad (negativa para salidas/ventas)
  stock_before: number;                // Stock antes del movimiento
  stock_after: number;                 // Stock después del movimiento
  reason: string | null;               // Razón del movimiento
  user_id: string;                     // Usuario que realizó el movimiento
  order_id: string | null;             // ID de orden (si aplica)
  created_at: string;                  // Timestamp de creación
  updated_at: string;                  // Timestamp de actualización

  // Relaciones (eager loaded opcional)
  product?: Product;
  user?: User;
  order?: Order;
}
```

---

## Tipos de Movimientos

```typescript
type StockMovementType =
  | 'entrada'              // Stock entry/purchase
  | 'salida'               // Manual exit
  | 'ajuste'               // Inventory adjustment/correction
  | 'reserva'              // Reservation for pending order
  | 'venta'                // Confirmed sale (deducts real stock)
  | 'cancelacion_reserva'; // Release reservation on order cancellation
```

### Descripción de Cada Tipo

| Tipo | Descripción | Cuándo se Crea | Quantity | Stock Real |
|------|-------------|----------------|----------|------------|
| **entrada** | Entrada de stock (compra, devolución) | Ajuste manual admin | `+X` | Aumenta |
| **salida** | Salida manual de stock | Ajuste manual admin | `-X` | Disminuye |
| **ajuste** | Corrección de inventario | Ajuste manual admin | `±X` | Aumenta/Disminuye |
| **reserva** | Reserva para orden pendiente | Al crear orden (auto) | `+X` | **No cambia** |
| **venta** | Venta confirmada | Al completar orden (auto) | `-X` | Disminuye |
| **cancelacion_reserva** | Liberación de reserva | Al cancelar orden (auto) | `-X` | **No cambia** |

### Flujo de Stock en Órdenes

```
┌─────────────────────────────────────────────────────────────┐
│ CREAR ORDEN (status: pending)                               │
│ ─────────────────────────────────────────────────────────── │
│ Backend automático:                                          │
│   • Crea movimiento: type='reserva', quantity=+5            │
│   • product.stock_reserved += 5                             │
│   • product.stock (real) NO cambia                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ COMPLETAR ORDEN (status: completed)                         │
│ ─────────────────────────────────────────────────────────── │
│ Backend automático:                                          │
│   • Crea movimiento: type='venta', quantity=-5              │
│   • product.stock_reserved -= 5  (libera reserva)          │
│   • product.stock -= 5           (descuenta real)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CANCELAR ORDEN (status: cancelled)                          │
│ ─────────────────────────────────────────────────────────── │
│ Backend automático:                                          │
│   • Crea movimiento: type='cancelacion_reserva', qty=-5    │
│   • product.stock_reserved -= 5  (libera reserva)          │
│   • product.stock (real) NO cambia                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Endpoints de API

### Historial de Movimientos

| Método | Endpoint | Descripción | Auth | Response |
|--------|----------|-------------|------|----------|
| GET | `/api/v1/products/{id}/stock-movements` | Obtener historial de movimientos de un producto | Sí | `StockMovement[]` |

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "product_id": 5,
    "type": "entrada",
    "quantity": 50,
    "stock_before": 0,
    "stock_after": 50,
    "reason": "Compra inicial",
    "user_id": 1,
    "order_id": null,
    "created_at": "2024-11-20T10:00:00Z",
    "updated_at": "2024-11-20T10:00:00Z"
  },
  {
    "id": 2,
    "product_id": 5,
    "type": "reserva",
    "quantity": 5,
    "stock_before": 50,
    "stock_after": 50,
    "reason": "Orden #ORD-001",
    "user_id": 3,
    "order_id": 10,
    "created_at": "2024-11-20T11:30:00Z",
    "updated_at": "2024-11-20T11:30:00Z"
  },
  {
    "id": 3,
    "product_id": 5,
    "type": "venta",
    "quantity": -5,
    "stock_before": 50,
    "stock_after": 45,
    "reason": "Orden #ORD-001 completada",
    "user_id": 1,
    "order_id": 10,
    "created_at": "2024-11-20T12:00:00Z",
    "updated_at": "2024-11-20T12:00:00Z"
  }
]
```

### Verificación de Disponibilidad

| Método | Endpoint | Descripción | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/api/v1/stock-movements/check-availability` | Verificar disponibilidad de múltiples productos | Sí | `{ items: [{ product_id, quantity }] }` |

**Request:**
```json
{
  "items": [
    { "product_id": "5", "quantity": 10 },
    { "product_id": "8", "quantity": 3 }
  ]
}
```

**Response (disponible):**
```json
{
  "available": true,
  "errors": []
}
```

**Response (no disponible):**
```json
{
  "available": false,
  "errors": [
    {
      "product_id": "5",
      "product_name": "Camiseta Roja",
      "requested": 10,
      "available": 7,
      "message": "Stock insuficiente para Camiseta Roja. Solicitado: 10, Disponible: 7"
    }
  ]
}
```

### Ajuste Manual de Stock

| Método | Endpoint | Descripción | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/api/v1/products/{id}/stock` | Ajustar stock manualmente (entrada/salida/ajuste) | Sí (Admin) | `AdjustStockDto` |

**Request (entrada):**
```json
{
  "type": "entrada",
  "quantity": 50,
  "reason": "Compra de proveedor ABC"
}
```

**Request (salida):**
```json
{
  "type": "salida",
  "quantity": 10,
  "reason": "Producto dañado"
}
```

**Request (ajuste):**
```json
{
  "type": "ajuste",
  "quantity": -5,
  "reason": "Corrección de inventario físico"
}
```

**Response:**
```json
{
  "id": 15,
  "product_id": 5,
  "type": "entrada",
  "quantity": 50,
  "stock_before": 45,
  "stock_after": 95,
  "reason": "Compra de proveedor ABC",
  "user_id": 1,
  "order_id": null,
  "created_at": "2024-11-24T14:30:00Z",
  "updated_at": "2024-11-24T14:30:00Z"
}
```

---

## Funcionalidades

### 1. Servicio de Stock Movements

```typescript
// src/features/products/services/stock-movements.service.ts

class StockMovementsService {
  /**
   * Obtener historial de movimientos de un producto
   */
  async getByProduct(productId: string): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>(
      API_ENDPOINTS.PRODUCT_STOCK_MOVEMENTS(productId)
    );
    return response.data.map(transformLaravelStockMovement);
  }

  /**
   * Verificar disponibilidad de stock antes de crear orden
   * (Validación para UX - doble verificación en backend)
   */
  async checkAvailability(
    items: Array<{ product_id: string; quantity: number }>
  ): Promise<StockAvailability> {
    const response = await api.post<StockAvailability>(
      '/v1/stock-movements/check-availability',
      { items }
    );
    return response.data;
  }

  /**
   * Ajuste manual de stock (solo admin)
   */
  async adjustStock(
    productId: string,
    dto: AdjustStockDto
  ): Promise<StockMovement> {
    const response = await api.post<StockMovement>(
      API_ENDPOINTS.PRODUCT_STOCK(productId),
      dto
    );
    return transformLaravelStockMovement(response.data);
  }
}

export const stockMovementsService = new StockMovementsService();
```

### 2. Transformer Laravel ↔ Frontend

```typescript
// src/features/products/utils/transformers.ts

export const transformLaravelStockMovement = (laravelMovement: any): StockMovement => {
  return {
    id: String(laravelMovement.id),
    product_id: String(laravelMovement.product_id),
    type: laravelMovement.type,
    quantity: Number(laravelMovement.quantity),
    stock_before: Number(laravelMovement.stock_before),
    stock_after: Number(laravelMovement.stock_after),
    reason: laravelMovement.reason,
    user_id: String(laravelMovement.user_id),
    order_id: laravelMovement.order_id ? String(laravelMovement.order_id) : null,
    created_at: laravelMovement.created_at,
    updated_at: laravelMovement.updated_at,
    product: laravelMovement.product,
    user: laravelMovement.user,
    order: laravelMovement.order,
  };
};
```

### 3. Tipos TypeScript

```typescript
// src/features/products/types/stock-movement.types.ts

export type StockMovementType =
  | 'entrada'
  | 'salida'
  | 'ajuste'
  | 'reserva'
  | 'venta'
  | 'cancelacion_reserva';

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  user_id: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  user?: any;
  order?: Order;
}

export interface AdjustStockDto {
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  reason?: string;
}

export interface StockAvailability {
  available: boolean;
  errors: StockAvailabilityError[];
}

export interface StockAvailabilityError {
  product_id: string;
  product_name: string;
  requested: number;
  available: number;
  message: string;
}
```

### 4. Componente de Historial

```typescript
// src/features/products/components/StockMovementHistory.tsx

import { useEffect, useState } from 'react';
import { stockMovementsService } from '../services';
import type { StockMovement } from '../types';

interface Props {
  productId: string;
}

export const StockMovementHistory: React.FC<Props> = ({ productId }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, [productId]);

  const loadMovements = async () => {
    setIsLoading(true);
    try {
      const data = await stockMovementsService.getByProduct(productId);
      setMovements(data);
    } catch (error) {
      console.error('Error loading stock movements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Cargando historial...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historial de Movimientos</h3>
      <div className="space-y-2">
        {movements.map(movement => (
          <div key={movement.id} className="border p-4 rounded">
            <div className="flex justify-between">
              <span className="font-medium">
                {getMovementTypeLabel(movement.type)}
              </span>
              <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Stock: {movement.stock_before} → {movement.stock_after}
            </div>
            {movement.reason && (
              <div className="text-sm text-gray-500">{movement.reason}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              {new Date(movement.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getMovementTypeLabel = (type: StockMovementType): string => {
  const labels: Record<StockMovementType, string> = {
    entrada: '📦 Entrada',
    salida: '📤 Salida',
    ajuste: '⚙️ Ajuste',
    reserva: '🔒 Reserva',
    venta: '💰 Venta',
    cancelacion_reserva: '🔓 Cancelación Reserva',
  };
  return labels[type];
};
```

---

## Integración con Órdenes

### Responsabilidades Frontend vs Backend

```typescript
// ❌ Frontend NO debe llamar directamente a:
// - stockMovementsService.reserveStock()       // NO EXISTE
// - stockMovementsService.confirmSale()        // NO EXISTE
// - stockMovementsService.releaseReservation() // NO EXISTE

// ✅ Frontend solo llama a:
// 1. Verificación pre-orden (para UX)
await stockMovementsService.checkAvailability(items);

// 2. Ajuste manual de stock (admin)
await stockMovementsService.adjustStock(productId, {
  type: 'entrada',
  quantity: 50,
  reason: 'Compra proveedor'
});

// 3. Ver historial
const movements = await stockMovementsService.getByProduct(productId);
```

### Flujo Completo en OrdersContext

```typescript
// src/features/orders/contexts/OrdersContext.tsx

const addOrder = async (orderData: OrderData): Promise<string> => {
  // 1. Calcular totales
  const subtotal = orderData.items.reduce(...);
  const total = subtotal;

  // 2. FRONTEND: Verificar disponibilidad (UX)
  const availability = await stockMovementsService.checkAvailability(
    orderData.items.map(item => ({
      product_id: String(item.product_id),
      quantity: item.quantity,
    }))
  );

  if (!availability.available) {
    const errorMessages = availability.errors
      .map(err => `${err.product_name}: solicitado ${err.requested}, disponible ${err.available}`)
      .join(', ');

    toast.error('Stock insuficiente', { description: errorMessages });
    throw new Error('Stock insuficiente');
  }

  // 3. Crear orden
  // BACKEND automáticamente:
  // - Verifica stock nuevamente (doble verificación)
  // - Crea la orden
  // - Crea movimiento: type='reserva'
  // - Incrementa product.stock_reserved
  const result = await ordersService.create(orderData);

  // 4. Actualizar estado local
  setOrders(prev => [result.data, ...prev]);

  return result.data.id;
};

const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  // BACKEND automáticamente:
  // - Si status='completed': crea movimiento 'venta', descuenta stock real
  // - Si status='cancelled': crea movimiento 'cancelacion_reserva', libera reserva
  await ordersService.updateStatus(orderId, status);

  // Actualizar estado local
  setOrders(prev =>
    prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    )
  );
};
```

---

## Trazabilidad Completa

### Ejemplo de Historial de un Producto

```
Producto: Camiseta Roja (ID: 5)

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #1 - 20/11/2024 10:00                               │
│ Tipo: 📦 Entrada                                                │
│ Cantidad: +50                                                   │
│ Stock: 0 → 50                                                   │
│ Razón: "Compra inicial proveedor XYZ"                          │
│ Usuario: Admin (ID: 1)                                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #2 - 20/11/2024 11:30                               │
│ Tipo: 🔒 Reserva                                                │
│ Cantidad: +5                                                    │
│ Stock: 50 → 50  (reservado +5, real sin cambios)              │
│ Razón: "Orden #ORD-001"                                         │
│ Usuario: Cliente Juan (ID: 3)                                   │
│ Orden: ORD-001                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #3 - 20/11/2024 12:00                               │
│ Tipo: 💰 Venta                                                  │
│ Cantidad: -5                                                    │
│ Stock: 50 → 45  (reservado -5, real -5)                       │
│ Razón: "Orden #ORD-001 completada"                             │
│ Usuario: Admin (ID: 1)                                          │
│ Orden: ORD-001                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #4 - 21/11/2024 09:00                               │
│ Tipo: 📦 Entrada                                                │
│ Cantidad: +30                                                   │
│ Stock: 45 → 75                                                  │
│ Razón: "Reabastecimiento"                                       │
│ Usuario: Admin (ID: 1)                                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #5 - 21/11/2024 14:00                               │
│ Tipo: 🔒 Reserva                                                │
│ Cantidad: +10                                                   │
│ Stock: 75 → 75  (reservado +10, real sin cambios)             │
│ Razón: "Orden #ORD-005"                                         │
│ Usuario: Cliente María (ID: 7)                                  │
│ Orden: ORD-005                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #6 - 21/11/2024 14:30                               │
│ Tipo: 🔓 Cancelación Reserva                                    │
│ Cantidad: -10                                                   │
│ Stock: 75 → 75  (reservado -10, real sin cambios)             │
│ Razón: "Orden #ORD-005 cancelada"                              │
│ Usuario: Cliente María (ID: 7)                                  │
│ Orden: ORD-005                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #7 - 22/11/2024 11:00                               │
│ Tipo: 📤 Salida                                                 │
│ Cantidad: -3                                                    │
│ Stock: 75 → 72                                                  │
│ Razón: "Producto dañado - descarte"                            │
│ Usuario: Admin (ID: 1)                                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Movimiento #8 - 23/11/2024 15:00                               │
│ Tipo: ⚙️ Ajuste                                                 │
│ Cantidad: -2                                                    │
│ Stock: 72 → 70                                                  │
│ Razón: "Corrección inventario físico"                          │
│ Usuario: Admin (ID: 1)                                          │
└────────────────────────────────────────────────────────────────┘

Estado Actual del Producto:
- Stock Real: 70 unidades
- Stock Reservado: 0 unidades
- Stock Disponible: 70 unidades
```

### Auditoría y Reportes

Con este sistema se puede:

1. **Rastrear cualquier cambio de stock** hasta su origen
2. **Identificar órdenes asociadas** a movimientos
3. **Ver quién hizo cada cambio** (user_id)
4. **Detectar discrepancias** entre stock físico y sistema
5. **Generar reportes** de entradas/salidas/ventas por período
6. **Analizar rotación de inventario** por producto
7. **Reconciliar inventario** con historial completo

---

## Archivos del Módulo

### Servicios

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **stock-movements.service.ts** | [src/features/products/services/](src/features/products/services/stock-movements.service.ts:1) | API calls para stock movements |

### Tipos

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **stock-movement.types.ts** | [src/features/products/types/](src/features/products/types/stock-movement.types.ts:1) | Interfaces y types de stock |

### Componentes

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **StockMovementHistory.tsx** | [src/features/products/components/](src/features/products/components/StockMovementHistory.tsx:1) | Visualización de historial |

### Transformers

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **transformers.ts** | [src/features/products/utils/](src/features/products/utils/transformers.ts:1) | Mapeo Laravel ↔ Frontend |

### API Endpoints

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **constants.ts** | [src/api/](src/api/constants.ts:26) | Definición de endpoints |

```typescript
// Endpoints de Stock Movements
API_ENDPOINTS.PRODUCT_STOCK(id)               // POST /v1/products/{id}/stock
API_ENDPOINTS.PRODUCT_STOCK_MOVEMENTS(id)     // GET  /v1/products/{id}/stock-movements
'/v1/stock-movements/check-availability'      // POST (verificación)
```

---

## Checklist de Pruebas

### Ajustes Manuales
- [ ] Crear entrada de stock (type: 'entrada')
- [ ] Verificar stock_after aumentó correctamente
- [ ] Verificar movimiento registrado en historial
- [ ] Crear salida de stock (type: 'salida')
- [ ] Verificar stock_after disminuyó correctamente
- [ ] Crear ajuste de stock (type: 'ajuste')
- [ ] Verificar razón se guarda correctamente

### Integración con Órdenes
- [ ] Crear orden pendiente → verifica movimiento 'reserva'
- [ ] Stock reservado aumenta, stock real NO cambia
- [ ] Completar orden → verifica movimiento 'venta'
- [ ] Stock reservado disminuye, stock real disminuye
- [ ] Cancelar orden → verifica movimiento 'cancelacion_reserva'
- [ ] Stock reservado disminuye, stock real NO cambia
- [ ] Eliminar orden pendiente → libera reserva

### Verificación de Disponibilidad
- [ ] checkAvailability con stock suficiente retorna available=true
- [ ] checkAvailability con stock insuficiente retorna available=false
- [ ] Errores incluyen product_name, requested, available
- [ ] Verificación considera stock reservado

### Historial
- [ ] Ver historial completo de un producto
- [ ] Movimientos ordenados por fecha (más reciente primero)
- [ ] Stock_before y stock_after correctos en cada movimiento
- [ ] order_id presente en movimientos de órdenes
- [ ] user_id presente en todos los movimientos
- [ ] Razón visible en cada movimiento

### Trazabilidad
- [ ] Cada cambio de stock tiene un movimiento registrado
- [ ] No hay cambios de stock sin trazabilidad
- [ ] Suma de quantities = cambio total de stock
- [ ] stock_after de movimiento N = stock_before de movimiento N+1

---

## Notas Importantes

1. **Backend Automático**: Los movimientos de tipo `reserva`, `venta` y `cancelacion_reserva` son creados AUTOMÁTICAMENTE por el backend. Frontend NO los crea manualmente.

2. **Doble Verificación**: Aunque frontend verifica disponibilidad con `checkAvailability()`, el backend SIEMPRE verifica nuevamente al crear la orden.

3. **Stock vs Stock Reservado**:
   - `product.stock`: Stock real/físico disponible para venta
   - `product.stock_reserved`: Stock reservado por órdenes pendientes
   - **Stock disponible** = `stock - stock_reserved`

4. **Quantity Negativa**: En movimientos de tipo `salida`, `venta` y `cancelacion_reserva`, la quantity es negativa para indicar disminución.

5. **Auditoría**: Todos los movimientos registran `user_id` para auditoría. Los movimientos automáticos usan el ID del usuario autenticado que realizó la acción (crear/completar/cancelar orden).

6. **Eager Loading**: Al obtener historial, se pueden incluir relaciones `product`, `user` y `order` para mostrar más detalles en la UI.

7. **Integridad de Datos**: El backend valida que `stock_after = stock_before + quantity` en cada movimiento para garantizar consistencia.

8. **Solo Admin**: Los ajustes manuales (`entrada`, `salida`, `ajuste`) solo están disponibles para usuarios admin/super_admin.
