# Plan de Implementación - Dashboard Analytics & Reportes

> **Proyecto:** TAB - Sistema de Gestión de Ventas
> **Fecha:** 28 de Noviembre, 2025
> **Objetivo:** Implementar sistema de analytics/dashboard y reportes exportables (PDF/Excel)

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Sección 1: Analytics & Dashboard](#sección-1-analytics--dashboard)
3. [Sección 2: Sistema de Reportes](#sección-2-sistema-de-reportes)
4. [Arquitectura General](#arquitectura-general)
5. [Estimación de Tiempos](#estimación-de-tiempos)
6. [Endpoints del Backend](#endpoints-del-backend)
7. [Checklist de Implementación](#checklist-de-implementación)

---

## Resumen Ejecutivo

### Alcance del Proyecto

Implementar dos sistemas complementarios:

1. **Dashboard Analytics** - Métricas en tiempo real con caching para performance
2. **Sistema de Reportes** - Exportación de datos en PDF/Excel para 3 módulos

### Principios de Diseño

✅ **Simple y Directo** - Sin sobreingeniería
✅ **Performance Optimizado** - Cache strategy con TTLs inteligentes
✅ **Mantenible** - Código limpio siguiendo arquitectura actual
✅ **Escalable** - Fácil agregar nuevas métricas/reportes

### Stack Tecnológico

**Backend:**
- Laravel (existente)
- Laravel Excel (Maatwebsite/Excel) - Para exportar a Excel
- DomPDF (Barryvdh/Laravel-DomPDF) - Para generar PDFs
- Laravel Cache - Para optimización

**Frontend:**
- React + TypeScript (existente)
- jsPDF + jsPDF-AutoTable (ya instalado) - Respaldo para exportación rápida
- xlsx (ya instalado) - Respaldo para exportación rápida
- Recharts (ya instalado) - Visualizaciones

---

## Sección 1: Analytics & Dashboard

### Objetivo

Proveer métricas en tiempo real del negocio con cálculos optimizados en el backend.

### Funcionalidades

#### 1.1 Métricas Principales (Overview)

**KPIs básicos:**
- Total de ingresos (todas las ventas completadas)
- Ingresos del mes actual
- Ingresos del día actual
- Ingresos del año actual
- Pedidos pendientes (contador)
- Pedidos completados (contador)
- Valor promedio de orden

**KPIs de ganancias (requiere `cost_price` en productos):**
- Ganancias totales
- Ganancias del mes
- Ganancias del día
- Ganancias del año
- Margen de ganancia (%)

**Cache:** 5 minutos

#### 1.2 Tendencia de Ventas (Sales Trend)

**Datos:**
- Últimos 7 días de ventas
- Ingresos por día
- Cantidad de órdenes por día
- Ganancias por día (opcional)

**Visualización:** Gráfico de líneas con Recharts

**Cache:** 10 minutos

#### 1.3 Pedidos Recientes

**Datos:**
- Últimos 5 pedidos (cualquier estado excepto cancelados)
- Información del cliente
- Total de la orden
- Estado

**Cache:** 2 minutos (datos más dinámicos)

#### 1.4 Top Productos

**Datos:**
- Top 5 productos más vendidos
- Cantidad vendida
- Ingresos generados
- Ganancia (opcional)

**Cache:** 15 minutos (cambia lentamente)

#### 1.5 Resumen Rápido

**Datos:**
- Productos vendidos (total unique products)
- Órdenes completadas
- Órdenes pendientes
- Valor promedio de orden

**Cache:** 5 minutos

#### 1.6 Análisis Anual (Nuevo)

**Datos:**
- Ingresos totales del año seleccionado
- Costos totales del año
- Ganancias totales del año
- Margen de ganancia (%)
- Cantidad de órdenes
- Valor promedio de orden
- Desglose mensual (12 meses)

**Cache:** 1 día (datos históricos)

### Estructura Backend - Analytics

```
Backend-Api-TAB-v3/
├── app/
│   ├── Http/Controllers/
│   │   ├── DashboardController.php (NUEVO)
│   │   └── AnalyticsController.php (NUEVO)
│   │
│   └── Services/
│       └── Dashboard/
│           ├── DashboardMetricsService.php (NUEVO) ⭐ CORE
│           └── AnalyticsService.php (NUEVO)
│
├── database/migrations/
│   └── 2025_11_28_add_cost_price_to_products.php (NUEVO)
│
└── routes/api.php (MODIFICAR)
```

### Estructura Frontend - Analytics

```
FrontEnd-TAB-main/src/features/admin-dashboard/
├── types/
│   └── dashboard.types.ts (EXTENDER - agregar profit metrics)
│
├── services/
│   ├── dashboard.service.ts (NUEVO - API calls)
│   └── analytics.service.ts (NUEVO - Analytics API)
│
├── hooks/
│   ├── useDashboardMetrics.ts (EXISTENTE - mantener para local)
│   ├── useDashboardAPI.ts (NUEVO - fetch backend)
│   └── useYearlyAnalytics.ts (NUEVO)
│
└── components/
    ├── MetricsGrid.tsx (MODIFICAR - agregar tarjeta de ganancias)
    ├── SalesChart.tsx (MODIFICAR - agregar línea de profit)
    ├── YearlyProfitCard.tsx (NUEVO)
    └── MonthlyProfitChart.tsx (NUEVO)
```

### Cache Strategy (Analytics)

| Métrica | TTL | Invalidación |
|---------|-----|--------------|
| Overview Metrics | 5 min | Al completar/cancelar orden |
| Recent Orders | 2 min | Al crear/completar/cancelar orden |
| Top Products | 15 min | - (se actualiza automáticamente) |
| Sales Trend | 10 min | - (se actualiza automáticamente) |
| Yearly Analytics | 1 día | - (datos históricos) |

**Invalidación Selectiva:**
```php
// En OrderService::completeOrder()
Cache::forget('dashboard.overview');
Cache::forget('dashboard.recent_orders');
// NO invalida top_products ni sales_trend (actualización menos crítica)
```

---

## Sección 2: Sistema de Reportes

### Objetivo

Generar reportes exportables en PDF y Excel de 3 módulos principales.

### 2.1 Reporte de Ventas

#### Datos Incluidos

**Resumen:**
- Total de ingresos
- Total de costos
- Total de ganancias
- Margen de ganancia (%)
- Cantidad de órdenes
- Valor promedio de orden
- Total de unidades vendidas

**Detalle de Órdenes:**
- ID de orden
- Cliente
- Email
- Total
- Ganancia
- Estado
- Tipo (online/in-store)
- Fecha de creación

**Top Productos:**
- Nombre del producto
- SKU
- Cantidad vendida
- Ingresos generados
- Costo total
- Ganancia total

**Tendencia Diaria:**
- Fecha
- Ingresos del día
- Cantidad de órdenes
- Ganancia del día

#### Filtros

- Rango de fechas (start_date, end_date)
- Tipo de orden (online, in-store, all)
- Estado (completed, pending, cancelled, all) - **Por defecto: completed**

#### Formatos de Exportación

- **PDF:** Documento profesional con logo, tablas y resumen
- **Excel:** Múltiples hojas (Resumen, Órdenes, Top Productos, Tendencia)

### 2.2 Reporte de Productos

#### Datos Incluidos

**Resumen:**
- Total de productos
- Total de unidades en stock
- Valor total de inventario
- Costo total de inventario
- Ganancia potencial (valor - costo)
- Productos con stock bajo
- Productos sin stock
- Productos vendidos (en período filtrado)
- Unidades vendidas (en período filtrado)
- Ingresos por ventas (en período filtrado)

**Detalle de Productos:**
- ID
- Nombre
- SKU
- Categoría
- Precio
- Costo
- Stock actual
- Stock mínimo
- ¿Stock bajo? (boolean)
- Unidades vendidas (en período)
- Veces ordenado (en período)
- Ingresos generados (en período)
- Costo (en período)
- Ganancia (en período)
- Margen de ganancia (%)

**Top Vendedores:**
- Top 10 productos por ingresos

**Stock Bajo:**
- Productos donde stock <= stock_min

**Sin Ventas:**
- Productos que no se han vendido en el período

**Por Categoría:**
- Agrupación por categoría
- Cantidad de productos
- Stock total
- Valor total

#### Filtros

- Rango de fechas (para datos de ventas)
- Categoría (category_id, all)
- Solo stock bajo (boolean)
- Solo sin ventas (boolean)

#### Formatos de Exportación

- **PDF:** Documento con resumen, tablas de productos, gráficos de stock
- **Excel:** Múltiples hojas (Resumen, Productos, Stock Bajo, Sin Ventas, Por Categoría)

### 2.3 Reporte de Pedidos (BÁSICO + Auditoría Simple)

#### Datos Incluidos

**Resumen:**
- Total de pedidos
- Pedidos completados
- Pedidos pendientes
- Pedidos cancelados
- Ingresos totales (completados)
- Ingresos pendientes
- Ingresos cancelados
- Valor promedio de orden
- Total de artículos

**Detalle de Pedidos:**
- ID de orden
- Número de orden
- Cliente (nombre + email)
- Estado
- Tipo (online/in-store)
- Método de pago
- Opción de entrega (pickup/delivery)
- Subtotal
- Costo de envío
- Total
- Cantidad de artículos
- Total de unidades
- Fecha de creación
- Fecha de última actualización
- **Auditoría simple:**
  - ¿Quién creó? (user_id, user_name) - Para pedidos creados por admin
  - ¿Quién completó? (completed_by_user_id, completed_by_name, completed_at)
  - ¿Quién canceló? (cancelled_by_user_id, cancelled_by_name, cancelled_at)
  - ¿Quién eliminó? (deleted_by_user_id, deleted_by_name, deleted_at)

**Por Estado:**
- Agrupación por estado
- Cantidad
- Valor total
- Porcentaje

**Por Cliente:**
- Cliente
- Cantidad de órdenes
- Total gastado
- Valor promedio de orden
- Ordenado por total gastado (desc)

**Por Método de Pago:**
- Método de pago
- Cantidad
- Valor total

**Por Tipo:**
- Tipo (online/in-store)
- Cantidad
- Valor total

**Timeline:**
- Agrupación por día
- Cantidad de órdenes
- Ingresos
- Órdenes completadas
- Órdenes pendientes
- Órdenes canceladas

#### Filtros

- Rango de fechas
- Estado (completed, pending, cancelled, all)
- Tipo (online, in-store, all)
- Cliente (user_id) - Opcional

#### Auditoría Simple (Sin Sobreingeniería)

**Campos a agregar en tabla `orders` (Backend):**
```php
// Migration: add_audit_fields_to_orders_table
$table->unsignedBigInteger('completed_by')->nullable()->after('status');
$table->timestamp('completed_at')->nullable()->after('completed_by');
$table->unsignedBigInteger('cancelled_by')->nullable()->after('completed_at');
$table->timestamp('cancelled_at')->nullable()->after('cancelled_by');
$table->unsignedBigInteger('deleted_by')->nullable()->after('deleted_at');

// Foreign keys
$table->foreign('completed_by')->references('id')->on('users')->onDelete('set null');
$table->foreign('cancelled_by')->references('id')->on('users')->onDelete('set null');
$table->foreign('deleted_by')->references('id')->on('users')->onDelete('set null');
```

**Lógica de auditoría (Backend):**
```php
// En OrderService::completeOrder()
$order->update([
    'status' => 'completed',
    'completed_by' => auth()->id(),
    'completed_at' => now(),
]);

// En OrderService::cancelOrder()
$order->update([
    'status' => 'cancelled',
    'cancelled_by' => auth()->id(),
    'cancelled_at' => now(),
]);

// En OrderService::deleteOrder()
$order->update([
    'deleted_by' => auth()->id(),
]);
$order->delete(); // Soft delete
```

**Nota:**
- Los pedidos creados por **clientes** tendrán `user_id` del cliente (ya existe)
- Los pedidos creados por **admin** tendrán `user_id` del admin (creador)
- Solo guardamos auditoría de acciones de admin: completar, cancelar, eliminar
- **NO creamos tabla de auditoría separada** (mantener simple)

#### Formatos de Exportación

- **PDF:** Documento básico con resumen, tabla de pedidos y agrupaciones
- **Excel:** Múltiples hojas (Resumen, Pedidos, Por Estado, Por Cliente, Timeline)

### Estructura Backend - Reportes

```
Backend-Api-TAB-v3/
├── app/
│   ├── Http/Controllers/
│   │   └── ReportsController.php (NUEVO - Unificado para los 3 reportes)
│   │
│   ├── Services/Reports/
│   │   ├── ReportExportService.php (NUEVO - Motor compartido)
│   │   ├── SalesReportService.php (NUEVO)
│   │   ├── ProductsReportService.php (NUEVO)
│   │   └── OrdersReportService.php (NUEVO)
│   │
│   └── Exports/
│       ├── SalesReportExport.php (NUEVO - Laravel Excel)
│       ├── ProductsReportExport.php (NUEVO)
│       └── OrdersReportExport.php (NUEVO)
│
├── resources/views/reports/
│   ├── sales-pdf.blade.php (NUEVO)
│   ├── products-pdf.blade.php (NUEVO)
│   ├── orders-pdf.blade.php (NUEVO)
│   └── partials/
│       ├── header.blade.php (NUEVO - Compartido)
│       ├── footer.blade.php (NUEVO - Compartido)
│       └── summary-box.blade.php (NUEVO - Compartido)
│
└── database/migrations/
    └── 2025_11_28_add_audit_fields_to_orders.php (NUEVO)
```

### Estructura Frontend - Reportes

```
FrontEnd-TAB-main/src/
├── features/admin-dashboard/
│   ├── types/
│   │   └── reports.types.ts (NUEVO - Tipos de reportes)
│   │
│   ├── services/
│   │   └── reports.service.ts (NUEVO - API calls)
│   │
│   ├── hooks/
│   │   ├── useReportPreview.ts (NUEVO - Preview data)
│   │   ├── useReportExport.ts (NUEVO - Download)
│   │   └── useReportFilters.ts (NUEVO - Manage filters)
│   │
│   └── components/reports/
│       ├── SalesReportPanel.tsx (NUEVO)
│       ├── ProductsReportPanel.tsx (NUEVO)
│       ├── OrdersReportPanel.tsx (NUEVO)
│       ├── ReportPreview.tsx (NUEVO - Compartido)
│       ├── ReportFilters.tsx (NUEVO - Compartido)
│       ├── ExportButton.tsx (NUEVO - Compartido)
│       └── ReportSummaryCards.tsx (NUEVO - Compartido)
│
└── pages/
    └── AdminReports.tsx (NUEVO - Con tabs para los 3 reportes)
```

---

## Arquitectura General

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│                     HTTP Requests                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               ROUTES (routes/api.php)                   │
│                                                          │
│  Dashboard & Analytics:                                 │
│  • GET /v1/dashboard/metrics                            │
│  • GET /v1/analytics/yearly?year=2025                   │
│                                                          │
│  Reports (Preview):                                     │
│  • GET /v1/reports/sales/preview?filters               │
│  • GET /v1/reports/products/preview?filters            │
│  • GET /v1/reports/orders/preview?filters              │
│                                                          │
│  Reports (Download):                                    │
│  • GET /v1/reports/sales/download?format=pdf           │
│  • GET /v1/reports/products/download?format=excel      │
│  • GET /v1/reports/orders/download?format=pdf          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    CONTROLLERS                          │
│                                                          │
│  • DashboardController                                  │
│  • AnalyticsController                                  │
│  • ReportsController                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                         │
│                                                          │
│  Dashboard/                                             │
│  • DashboardMetricsService (Overview, Trend, etc.)      │
│  • AnalyticsService (Yearly, Monthly breakdown)         │
│                                                          │
│  Reports/                                               │
│  • SalesReportService (Build sales report data)         │
│  • ProductsReportService (Build products report data)   │
│  • OrdersReportService (Build orders report data)       │
│  • ReportExportService (Generate PDF/Excel)             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   CACHE LAYER                           │
│                                                          │
│  • dashboard.overview (5 min)                           │
│  • dashboard.recent_orders (2 min)                      │
│  • dashboard.top_products (15 min)                      │
│  • dashboard.sales_trend (10 min)                       │
│  • analytics.yearly.{year} (1 day)                      │
│                                                          │
│  Invalidation:                                          │
│  • OrderCompleted event → Forget overview, recent       │
│  • OrderCancelled event → Forget overview, recent       │
│  • OrderCreated event → Forget recent only              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 DATA LAYER (Eloquent)                   │
│                                                          │
│  Models: Order, OrderItem, Product, User                │
│  Optimizations:                                         │
│  • Eager loading: with(['items.product', 'user'])       │
│  • DB aggregations: sum(), count(), avg()               │
│  • Index usage: (status, created_at)                    │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PAGES LAYER                          │
│                                                          │
│  • Admin.tsx (Dashboard con métricas)                   │
│  • AdminReports.tsx (Hub de reportes con tabs)          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 COMPONENTS LAYER                        │
│                                                          │
│  Dashboard:                                             │
│  • MetricsGrid (4 tarjetas KPIs)                        │
│  • SalesChart (Tendencia 7 días)                        │
│  • YearlyProfitCard (Ganancias anuales)                 │
│  • RecentOrdersTable                                    │
│  • TopProductsTable                                     │
│                                                          │
│  Reports:                                               │
│  • SalesReportPanel (Filtros + Preview + Export)        │
│  • ProductsReportPanel (Filtros + Preview + Export)     │
│  • OrdersReportPanel (Filtros + Preview + Export)       │
│  • ReportPreview (Tabla compartida)                     │
│  • ReportFilters (Filtros compartidos)                  │
│  • ExportButton (Botón download compartido)             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    HOOKS LAYER                          │
│                                                          │
│  • useDashboardAPI (Fetch metrics del backend)          │
│  • useYearlyAnalytics (Fetch yearly data)               │
│  • useReportPreview (Fetch report preview)              │
│  • useReportExport (Download PDF/Excel)                 │
│  • useReportFilters (Manage filter state)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                         │
│                                                          │
│  • dashboard.service.ts (API calls dashboard)           │
│  • analytics.service.ts (API calls analytics)           │
│  • reports.service.ts (API calls reportes)              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                   API (Axios client)
```

---

## Estimación de Tiempos

| Fase | Descripción | Tiempo | Responsable |
|------|-------------|--------|-------------|
| **BACKEND** | | | |
| 1 | Database migrations (cost_price + audit fields) | 30 min | Backend Dev |
| 2 | Services Layer (Dashboard + Analytics) | 2-3 horas | Backend Dev |
| 3 | Services Layer (Reports - 3 reportes) | 3-4 horas | Backend Dev |
| 4 | Controllers & Routes | 1 hora | Backend Dev |
| 5 | Exports (Laravel Excel - 3 exporters) | 2 horas | Backend Dev |
| 6 | Blade Templates (PDF - 3 templates) | 2 horas | Backend Dev |
| 7 | Cache Invalidation (Listeners) | 30 min | Backend Dev |
| 8 | Testing Backend | 1 hora | Backend Dev |
| **FRONTEND** | | | |
| 9 | Types & Services | 1 hora | Frontend Dev |
| 10 | Hooks (Dashboard + Reports) | 2 horas | Frontend Dev |
| 11 | Components Dashboard | 2 horas | Frontend Dev |
| 12 | Components Reports | 3 horas | Frontend Dev |
| 13 | Pages & Routes | 1 hora | Frontend Dev |
| 14 | Testing Frontend | 1 hora | Frontend Dev |
| **TOTAL** | | **22-24 horas** | |

**Distribución:**
- Backend: 12-14 horas
- Frontend: 10 horas

**Recomendación:** Dividir en 3 sprints de 1 semana cada uno.

---

## Endpoints del Backend

### Dashboard & Analytics

```http
GET /api/v1/dashboard/metrics
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response:
{
  "success": true,
  "data": {
    "overview": {
      "total_revenue": 125000.50,
      "monthly_revenue": 34000.00,
      "daily_revenue": 5800.00,
      "yearly_revenue": 125000.50,
      "total_profit": 45000.00,
      "monthly_profit": 12000.00,
      "daily_profit": 2000.00,
      "yearly_profit": 45000.00,
      "profit_margin": 36.00,
      "pending_orders": 5,
      "completed_orders": 120,
      "average_order_value": 1041.67
    },
    "sales_trend": [
      { "date": "2025-11-21", "revenue": 850.00, "orders": 12, "profit": 300.00 },
      { "date": "2025-11-22", "revenue": 920.00, "orders": 15, "profit": 350.00 },
      ...
    ],
    "recent_orders": [
      {
        "id": 123,
        "order_number": "ORD-2025-001",
        "customer_name": "Juan Pérez",
        "customer_email": "juan@example.com",
        "total": 125.00,
        "status": "pending",
        "created_at": "2025-11-28T10:30:00Z"
      },
      ...
    ],
    "top_products": [
      {
        "product_id": 45,
        "product_name": "Producto A",
        "sku": "SKU-001",
        "quantity_sold": 150,
        "revenue": 4500.00,
        "cost": 3000.00,
        "profit": 1500.00
      },
      ...
    ],
    "quick_summary": {
      "products_sold": 320,
      "completed_orders": 120,
      "pending_orders": 5,
      "avg_order_value": 1041.67
    }
  },
  "meta": {
    "cached_at": "2025-11-28T14:30:00Z",
    "expires_at": "2025-11-28T14:35:00Z"
  }
}
```

```http
GET /api/v1/analytics/yearly?year=2025
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response:
{
  "success": true,
  "data": {
    "year": 2025,
    "total_revenue": 125000.50,
    "total_cost": 80000.00,
    "total_profit": 45000.50,
    "profit_margin": 36.00,
    "orders_count": 120,
    "average_order_value": 1041.67,
    "monthly_breakdown": [
      {
        "month": "Enero",
        "month_number": 1,
        "year": 2025,
        "revenue": 10000.00,
        "cost": 6500.00,
        "profit": 3500.00,
        "orders": 10
      },
      ...
    ]
  }
}
```

### Reports

```http
GET /api/v1/reports/sales/preview?start_date=2025-01-01&end_date=2025-12-31&status=completed&order_type=all
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response:
{
  "success": true,
  "data": {
    "summary": { ... },
    "orders": [ ... ],
    "top_products": [ ... ],
    "daily_trend": [ ... ],
    "filters": { ... },
    "generated_at": "2025-11-28T14:30:00Z"
  }
}
```

```http
GET /api/v1/reports/sales/download?format=pdf&start_date=2025-01-01&end_date=2025-12-31&status=completed
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response: Binary file download (PDF or Excel)
Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="sales-report-2025-11-28.pdf"
```

```http
GET /api/v1/reports/products/preview?start_date=2025-01-01&end_date=2025-12-31&category_id=all
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response: { "success": true, "data": { ... } }
```

```http
GET /api/v1/reports/products/download?format=excel&category_id=5
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response: Binary file download
```

```http
GET /api/v1/reports/orders/preview?start_date=2025-01-01&end_date=2025-12-31&status=all&type=all
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response: { "success": true, "data": { ... } }
```

```http
GET /api/v1/reports/orders/download?format=pdf&status=completed
Authorization: Bearer {token}
Middleware: auth:sanctum, admin

Response: Binary file download
```

---

## Checklist de Implementación

### Backend

#### Database
- [ ] Crear migración `add_cost_price_to_products`
- [ ] Crear migración `add_audit_fields_to_orders`
- [ ] Ejecutar migraciones
- [ ] Seedear datos de prueba (cost_price en productos existentes)

#### Services - Dashboard & Analytics
- [ ] Crear `DashboardMetricsService`
  - [ ] Método `getOverviewMetrics()`
  - [ ] Método `getSalesTrend()`
  - [ ] Método `getRecentOrders()`
  - [ ] Método `getTopProducts()`
  - [ ] Método `getQuickSummary()`
- [ ] Crear `AnalyticsService`
  - [ ] Método `getYearlyAnalytics()`
  - [ ] Método `getMonthlyBreakdown()`

#### Services - Reports
- [ ] Crear `ReportExportService` (motor compartido)
  - [ ] Método `generatePDF()`
  - [ ] Método `generateExcel()`
- [ ] Crear `SalesReportService`
  - [ ] Método `buildReport()`
  - [ ] Métodos helpers (calculateSummary, formatOrders, getTopProducts, getDailyTrend)
- [ ] Crear `ProductsReportService`
  - [ ] Método `buildReport()`
  - [ ] Métodos helpers (calculateSummary, formatProducts, getLowStock, getNoSales)
- [ ] Crear `OrdersReportService`
  - [ ] Método `buildReport()`
  - [ ] Métodos helpers (calculateSummary, formatOrders, groupByStatus, groupByCustomer)

#### Controllers
- [ ] Crear `DashboardController`
  - [ ] Método `getMetrics()`
- [ ] Crear `AnalyticsController`
  - [ ] Método `getYearlyAnalytics()`
- [ ] Crear `ReportsController`
  - [ ] Método `previewSalesReport()`
  - [ ] Método `downloadSalesReport()`
  - [ ] Método `previewProductsReport()`
  - [ ] Método `downloadProductsReport()`
  - [ ] Método `previewOrdersReport()`
  - [ ] Método `downloadOrdersReport()`

#### Routes
- [ ] Agregar ruta `/v1/dashboard/metrics`
- [ ] Agregar ruta `/v1/analytics/yearly`
- [ ] Agregar rutas `/v1/reports/sales/preview` y `/download`
- [ ] Agregar rutas `/v1/reports/products/preview` y `/download`
- [ ] Agregar rutas `/v1/reports/orders/preview` y `/download`

#### Exports (Laravel Excel)
- [ ] Crear `SalesReportExport` con múltiples sheets
- [ ] Crear `ProductsReportExport` con múltiples sheets
- [ ] Crear `OrdersReportExport` con múltiples sheets

#### Blade Templates (PDF)
- [ ] Crear `resources/views/reports/partials/header.blade.php`
- [ ] Crear `resources/views/reports/partials/footer.blade.php`
- [ ] Crear `resources/views/reports/partials/summary-box.blade.php`
- [ ] Crear `resources/views/reports/sales-pdf.blade.php`
- [ ] Crear `resources/views/reports/products-pdf.blade.php`
- [ ] Crear `resources/views/reports/orders-pdf.blade.php`

#### Cache Invalidation
- [ ] Crear `InvalidateDashboardCache` listener
- [ ] Registrar listeners en `EventServiceProvider`
  - [ ] OrderCompleted → InvalidateDashboardCache
  - [ ] OrderCancelled → InvalidateDashboardCache
  - [ ] OrderCreated → InvalidateDashboardCache

#### Testing Backend
- [ ] Testear endpoint `/v1/dashboard/metrics` con Postman
- [ ] Testear endpoint `/v1/analytics/yearly` con Postman
- [ ] Testear preview de reportes (los 3)
- [ ] Testear descarga PDF (los 3)
- [ ] Testear descarga Excel (los 3)
- [ ] Verificar cache (hit/miss en logs)
- [ ] Verificar invalidación de cache

### Frontend

#### Types & Constants
- [ ] Extender `dashboard.types.ts` con profit metrics
- [ ] Crear `reports.types.ts` con todos los tipos de reportes
- [ ] Agregar endpoints a `api/constants.ts`

#### Services
- [ ] Crear `dashboard.service.ts`
  - [ ] Método `getMetrics()`
- [ ] Crear `analytics.service.ts`
  - [ ] Método `getYearlyAnalytics()`
- [ ] Crear `reports.service.ts`
  - [ ] Método `previewSalesReport()`
  - [ ] Método `downloadSalesReport()`
  - [ ] Método `previewProductsReport()`
  - [ ] Método `downloadProductsReport()`
  - [ ] Método `previewOrdersReport()`
  - [ ] Método `downloadOrdersReport()`

#### Hooks
- [ ] Crear `useDashboardAPI.ts`
- [ ] Crear `useYearlyAnalytics.ts`
- [ ] Crear `useReportPreview.ts`
- [ ] Crear `useReportExport.ts`
- [ ] Crear `useReportFilters.ts`

#### Components - Dashboard
- [ ] Modificar `MetricsGrid.tsx` (agregar tarjeta de ganancias anuales)
- [ ] Modificar `SalesChart.tsx` (agregar línea de profit)
- [ ] Crear `YearlyProfitCard.tsx`
- [ ] Crear `MonthlyProfitChart.tsx`

#### Components - Reports
- [ ] Crear `reports/SalesReportPanel.tsx`
- [ ] Crear `reports/ProductsReportPanel.tsx`
- [ ] Crear `reports/OrdersReportPanel.tsx`
- [ ] Crear `reports/ReportPreview.tsx` (compartido)
- [ ] Crear `reports/ReportFilters.tsx` (compartido)
- [ ] Crear `reports/ExportButton.tsx` (compartido)
- [ ] Crear `reports/ReportSummaryCards.tsx` (compartido)

#### Pages & Routes
- [ ] Modificar `Admin.tsx` (integrar nuevos componentes)
- [ ] Crear `AdminReports.tsx` (con tabs para los 3 reportes)
- [ ] Agregar ruta `/admin/reports` en `App.tsx`
- [ ] Agregar enlace en `AdminSidebar.tsx`

#### Testing Frontend
- [ ] Testear dashboard (visualización de métricas)
- [ ] Testear tarjeta de ganancias anuales
- [ ] Testear gráficos
- [ ] Testear preview de reportes (los 3)
- [ ] Testear descarga PDF (los 3)
- [ ] Testear descarga Excel (los 3)
- [ ] Testear filtros
- [ ] Verificar responsive design

---

## Notas Importantes

### Principios de Implementación

1. **No Sobreingeniería:**
   - Auditoría simple con campos en la tabla orders (NO tabla separada)
   - Cacheo básico con TTLs fijos (NO cache warming complejo)
   - Reportes estándar (NO reportes personalizables por usuario)

2. **Performance:**
   - Usar agregaciones en DB (sum, count, avg)
   - Eager loading siempre (with())
   - Aprovechar índices existentes
   - Cache con invalidación selectiva

3. **Mantenibilidad:**
   - Código limpio y comentado
   - Seguir arquitectura actual del proyecto
   - Reutilizar componentes (DRY)
   - Blade templates modulares con partials

4. **Seguridad:**
   - Todos los endpoints protegidos con auth:sanctum
   - Solo usuarios admin pueden acceder
   - Validación de filtros en backend
   - Sanitización de datos en PDFs

### Dependencias a Instalar

**Backend:**
```bash
composer require maatwebsite/excel
composer require barryvdh/laravel-dompdf
```

**Frontend:**
```bash
# Ya instalados en package.json
# jspdf, jspdf-autotable, xlsx, recharts
```

---

## Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Instalar dependencias del backend**
3. **Comenzar implementación por fases:**
   - Sprint 1: Backend Analytics + Database
   - Sprint 2: Backend Reports + Frontend Analytics
   - Sprint 3: Frontend Reports + Testing

---

**Documento creado:** 28 de Noviembre, 2025
**Última actualización:** 28 de Noviembre, 2025
**Versión:** 1.0
