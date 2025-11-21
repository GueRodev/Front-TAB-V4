# Integración del Sistema de Categorías

## Tabla de Contenidos
- [Resumen General](#resumen-general)
- [Arquitectura](#arquitectura)
- [Backend (Laravel)](#backend-laravel)
- [Frontend (React/TypeScript)](#frontend-reacttypescript)
- [Sistema de Restauración Inteligente](#sistema-de-restauración-inteligente)
- [Endpoints de API](#endpoints-de-api)
- [Flujo de Datos](#flujo-de-datos)
- [Checklist de Pruebas](#checklist-de-pruebas)
- [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)

---

## Resumen General

Esta documentación cubre la integración completa del sistema de Categorías entre el frontend React/TypeScript y el backend Laravel, incluyendo:

- ✅ **Eliminación suave (Soft Delete)** con retención de 30 días
- ✅ **Papelera de reciclaje** con UI dedicada
- ✅ **Restauración inteligente de productos** usando `original_category_id`
- ✅ **Actualizaciones optimistas** para UX instantánea
- ✅ **Lazy loading** de datos de papelera con skeleton states
- ✅ **Jerarquía de categorías** con subcategorías ilimitadas
- ✅ **Categoría protegida "Otros"** para productos huérfanos

---

## Arquitectura

### Stack Tecnológico

**Backend:**
- Laravel 10+
- PostgreSQL
- Sanctum (autenticación)
- Eloquent ORM
- Soft Deletes trait

**Frontend:**
- React 18
- TypeScript
- Context API (manejo de estado global)
- Axios (peticiones HTTP)
- Zod (validación)
- TanStack Query (en componentes)
- Shadcn UI (componentes UI)

### Estructura de Archivos

```
Backend:
├── app/
│   ├── Models/
│   │   ├── Category.php (con SoftDeletes)
│   │   └── Product.php (con original_category_id)
│   └── Http/
│       ├── Controllers/Api/v1/
│       │   ├── CategoryController.php
│       │   └── ProductController.php
│       └── Requests/v1/
│           ├── StoreCategoryRequest.php
│           └── UpdateCategoryRequest.php
├── database/migrations/
│   └── 2025_11_21_161937_add_original_category_id_to_products_table.php
└── routes/v1/
    └── categories.php

Frontend:
├── src/
│   ├── features/categories/
│   │   ├── components/
│   │   │   └── CategoryRecycleBin.tsx
│   │   ├── contexts/
│   │   │   └── CategoriesContext.tsx
│   │   ├── hooks/
│   │   │   ├── useCategoryRecycleBin.ts
│   │   │   └── useCategoriesAdmin.ts
│   │   ├── services/
│   │   │   └── categories.service.ts
│   │   └── types/
│   │       └── category.types.ts
│   └── api/
│       └── constants.ts
```

---

## Backend (Laravel)

### 1. Migración: Campo `original_category_id`

**Archivo:** `database/migrations/2025_11_21_161937_add_original_category_id_to_products_table.php`

**Propósito:** Rastrear la categoría original de un producto antes de ser reasignado a "Otros", permitiendo restauración inteligente.

```php
public function up(): void
{
    Schema::table('products', function (Blueprint $table) {
        // Campo para rastrear categoría original
        $table->unsignedBigInteger('original_category_id')
              ->nullable()
              ->after('category_id');

        // Foreign key con onDelete('set null') para evitar errores
        $table->foreign('original_category_id')
              ->references('id')
              ->on('categories')
              ->onDelete('set null');

        $table->index('original_category_id');
    });
}
```

**⚠️ Importante:** El constraint `onDelete('set null')` es crucial - si una categoría se elimina permanentemente, las referencias se limpian automáticamente sin romper la integridad referencial.

### 2. Modelo: Product.php

**Cambios realizados:**

```php
protected $fillable = [
    'name', 'slug', 'brand', 'description', 'price',
    'stock', 'sku', 'image_url', 'category_id',
    'original_category_id', // ⭐ NUEVO CAMPO
    'status', 'is_featured'
];

/**
 * Relación con la categoría original (antes de reasignación)
 */
public function originalCategory()
{
    return $this->belongsTo(Category::class, 'original_category_id');
}
```

### 3. Controlador: CategoryController.php

#### Método `destroy()` - Soft Delete

**Líneas clave:** [130-135](CategoryController.php#L130-L135)

```php
public function destroy($id)
{
    $category = Category::findOrFail($id);

    // Validar que no sea categoría protegida
    if ($category->is_protected) {
        return response()->json([
            'message' => 'No se puede eliminar una categoría protegida'
        ], 403);
    }

    // Obtener categoría "Otros"
    $otherCategory = Category::where('is_protected', true)->first();

    if (!$otherCategory) {
        return response()->json([
            'message' => 'Categoría protegida no encontrada. Error del sistema.',
            'error' => 'PROTECTED_CATEGORY_MISSING'
        ], 500);
    }

    $productsCount = $category->products()->count();

    // ⭐ PASO CRÍTICO: Guardar categoría original ANTES de eliminar
    if ($productsCount > 0) {
        $category->products()->update([
            'original_category_id' => $id,        // Guardar la original
            'category_id' => $otherCategory->id   // Reasignar a "Otros"
        ]);
    }

    // Soft delete
    $category->delete();

    return response()->json([
        'message' => 'Categoría eliminada exitosamente',
        'productos_reasignados' => $productsCount
    ]);
}
```

**Flujo:**
1. Validar que no sea categoría protegida ("Otros")
2. Obtener la categoría "Otros" para reasignación
3. **Guardar `original_category_id`** en todos los productos de la categoría
4. Reasignar productos a "Otros" (`category_id`)
5. Soft delete de la categoría

#### Método `restore()` - Restauración Inteligente

**Líneas clave:** [200-217](CategoryController.php#L200-L217)

```php
public function restore($id)
{
    $category = Category::withTrashed()->findOrFail($id);
    $category->restore();

    // ⭐ RESTAURAR PRODUCTOS que esperaban esta categoría
    $productsRestored = \App\Models\Product::where('original_category_id', $id)
        ->update([
            'category_id' => $id,              // Devolver a categoría restaurada
            'original_category_id' => null     // Limpiar referencia
        ]);

    return response()->json([
        'message' => 'Categoría restaurada exitosamente',
        'category' => $category,
        'productos_restaurados' => $productsRestored
    ]);
}
```

**Flujo:**
1. Restaurar la categoría eliminada
2. Buscar productos con `original_category_id = $id`
3. Devolverlos a la categoría restaurada
4. Limpiar `original_category_id`

#### Método `forceDelete()` - Eliminación Permanente

**Líneas clave:** [179-185](CategoryController.php#L179-L185)

```php
public function forceDelete($id)
{
    $category = Category::withTrashed()->findOrFail($id);

    if ($category->is_protected) {
        return response()->json([
            'message' => 'No se puede eliminar una categoría protegida'
        ], 403);
    }

    $otherCategory = Category::where('is_protected', true)->first();

    if (!$otherCategory) {
        return response()->json([
            'message' => 'Categoría protegida no encontrada. Error del sistema.',
            'error' => 'PROTECTED_CATEGORY_MISSING'
        ], 500);
    }

    // Reasignar productos actuales (si aún tiene)
    $productsCount = $category->products()->count();

    if ($productsCount > 0) {
        $category->products()->update([
            'category_id' => $otherCategory->id
        ]);
    }

    // ⭐ LIMPIAR referencias huérfanas de original_category_id
    $productsWithOriginal = \App\Models\Product::where('original_category_id', $id)->count();

    if ($productsWithOriginal > 0) {
        \App\Models\Product::where('original_category_id', $id)
            ->update(['original_category_id' => null]);
    }

    $category->forceDelete();

    return response()->json([
        'message' => 'Categoría eliminada permanentemente de forma exitosa',
        'productos_reasignados' => $productsCount,
        'referencias_limpiadas' => $productsWithOriginal
    ]);
}
```

**Flujo:**
1. Reasignar productos actuales a "Otros"
2. **Limpiar referencias de `original_category_id`** (productos que esperaban esta categoría quedan en "Otros" permanentemente)
3. Eliminación física de la categoría

#### Método `recycleBin()` - Endpoint de Papelera

**Líneas clave:** [223-240](CategoryController.php#L223-L240)

```php
public function recycleBin()
{
    // Obtener categorías eliminadas (incluyendo subcategorías)
    $deletedCategories = Category::onlyTrashed()
        ->with(['parent' => function($query) {
            $query->withTrashed(); // Incluir padre aunque esté eliminado
        }])
        ->withCount('products')
        ->orderBy('deleted_at', 'desc')
        ->get();

    // ⭐ Agregar contador de productos que serán restaurados
    $deletedCategories->each(function($category) {
        $category->restorable_products_count = \App\Models\Product::where('original_category_id', $category->id)->count();
    });

    return response()->json($deletedCategories);
}
```

**Detalles importantes:**
- `onlyTrashed()`: Solo categorías con soft delete
- `withTrashed()` en relación parent: Mostrar padre aunque esté eliminado
- `restorable_products_count`: Contador personalizado para UI

### 4. Controlador: ProductController.php

#### Método `update()` - Edge Case de Cambio Manual

**Líneas clave:** `update()` method

```php
public function update($id, UpdateProductRequest $request)
{
    $product = Product::findOrFail($id);
    $oldCategoryId = $product->category_id;

    $data = $request->validated();
    $data['slug'] = Str::slug($data['name']);

    // ⭐ Si se cambia category_id manualmente, limpiar original_category_id
    if (isset($data['category_id']) && $data['category_id'] != $oldCategoryId) {
        $data['original_category_id'] = null;
    }

    $product->update($data);

    return response()->json([
        'message' => 'Producto actualizado exitosamente',
        'product' => $product->load('category')
    ]);
}
```

**⚠️ Edge Case Manejado:**
Si un usuario mueve manualmente un producto a otra categoría después de eliminar su categoría original, ese producto NO debe volver a la categoría eliminada si se restaura. Al limpiar `original_category_id` en cambios manuales, evitamos este problema.

### 5. Rutas: routes/v1/categories.php

**⚠️ ORDEN CRÍTICO:** Las rutas específicas DEBEN ir ANTES de las rutas con `{id}`.

```php
// RUTAS PÚBLICAS
Route::get('/categories', [CategoryController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:Super Admin'])->group(function () {
    // ⭐ RUTAS ESPECÍFICAS PRIMERO (antes de {id})
    Route::put('/categories/reorder', [CategoryController::class, 'reorder']);
    Route::get('/categories/recycle-bin', [CategoryController::class, 'recycleBin']);

    // RUTAS CON {id} DESPUÉS
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('/categories/{id}/restore', [CategoryController::class, 'restore']);
    Route::delete('/categories/{id}/force', [CategoryController::class, 'forceDelete']);
});

// RUTAS PÚBLICAS CON {id} - AL FINAL
Route::get('/categories/{id}', [CategoryController::class, 'show']);
```

**❌ Error común:** Si defines `/categories/{id}` antes de `/categories/recycle-bin`, Laravel interpretará "recycle-bin" como un ID y dará error 500.

---

## Frontend (React/TypeScript)

### 1. Tipos: category.types.ts

**Cambios clave:**

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Jerarquía
  parent_id: string | null;
  level: number;
  order: number;

  // Estado
  is_protected: boolean;
  is_active: boolean;

  // Relaciones
  children?: Category[];
  subcategories?: Subcategory[];
  products_count?: number;
  restorable_products_count?: number; // ⭐ NUEVO - Productos que serán restaurados

  // Soft delete
  deleted_at?: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // UI
  isExpanded?: boolean;
}
```

### 2. Servicio: categories.service.ts

**Método nuevo: `getRecycleBin()`**

```typescript
async getRecycleBin(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await api.get(API_ENDPOINTS.CATEGORIES_RECYCLE_BIN);
    const categories = transformLaravelCategories(response.data);

    return {
      data: categories,
      message: 'Deleted categories retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching recycle bin:', error);
    throw error;
  }
}
```

**Constante en `api/constants.ts`:**

```typescript
export const API_ENDPOINTS = {
  // ... otros endpoints ...
  CATEGORIES_RECYCLE_BIN: "/v1/categories/recycle-bin",
} as const;
```

### 3. Contexto: CategoriesContext.tsx

**Actualizaciones Optimistas para UX Instantánea**

```typescript
interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  deletedCount: number; // ⭐ Contador optimista

  // ... otros métodos ...

  refreshDeletedCount: () => Promise<void>; // ⭐ Para recargar contador
}

// Estado
const [deletedCount, setDeletedCount] = useState(0);

// Función para refrescar contador
const refreshDeletedCount = async () => {
  try {
    const response = await categoriesService.getRecycleBin();
    setDeletedCount(response.data.length);
  } catch (error) {
    console.error('Error refreshing deleted count:', error);
  }
};

// Actualización optimista en deleteCategory
const deleteCategory = async (id: string) => {
  setLoading(true);
  try {
    await categoriesService.delete(id);
    setDeletedCount(prev => prev + 1); // ⭐ Incremento INMEDIATO
    await syncWithAPI();
  } catch (error) {
    await refreshDeletedCount(); // ⭐ Revertir en caso de error
    throw error;
  } finally {
    setLoading(false);
  }
};

// Actualización optimista en restoreCategory
const restoreCategory = async (id: string) => {
  setLoading(true);
  try {
    await categoriesService.restore(id);
    setDeletedCount(prev => Math.max(0, prev - 1)); // ⭐ Decremento INMEDIATO
    await syncWithAPI();
  } catch (error) {
    await refreshDeletedCount(); // ⭐ Revertir en caso de error
    throw error;
  } finally {
    setLoading(false);
  }
};

// Similar para forceDeleteCategory
```

**Beneficio:** El badge de la papelera actualiza instantáneamente sin esperar respuesta del servidor, mejorando significativamente la UX.

### 4. Hook: useCategoryRecycleBin.ts

**Lazy Loading Implementado**

```typescript
interface UseCategoryRecycleBinOptions {
  isVisible?: boolean; // ⭐ Para controlar cuándo cargar datos completos
}

export const useCategoryRecycleBin = (options?: UseCategoryRecycleBinOptions) => {
  const { restoreCategory, forceDeleteCategory } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const isVisible = options?.isVisible;

  // Cargar en mount
  useEffect(() => {
    loadDeletedCategories();
  }, []);

  // ⭐ Recargar cuando se abre la papelera
  useEffect(() => {
    if (isVisible) {
      loadDeletedCategories();
    }
  }, [isVisible]);

  const loadDeletedCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoriesService.getRecycleBin();
      setDeletedCategories(response.data);
    } catch (error) {
      console.error('Error loading deleted categories:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías eliminadas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... métodos handleRestore y handleForceDelete ...

  return {
    deletedCategories,
    deletedCount: deletedCategories.length,
    expiringCategories,
    isLoading,
    handleRestore,
    handleForceDelete,
    loadDeletedCategories, // ⭐ Exportado para recarga manual
    getDeletedCategory,
    isInRecycleBin,
  };
};
```

**Estrategia de Lazy Loading:**
1. Solo cargar **contador** al inicio (desde contexto)
2. Cargar **datos completos** cuando `isVisible=true`
3. Recargar automáticamente al abrir papelera
4. Skeleton loading mientras carga

### 5. Componente: CategoryRecycleBin.tsx

**Skeleton Loading State**

[Líneas 36-68](CategoryRecycleBin.tsx#L36-L68)

```typescript
if (isLoading && deletedCategories.length === 0) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Papelera de Reciclaje
        </CardTitle>
        <CardDescription>
          Cargando categorías eliminadas...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* ⭐ Skeleton loaders */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-muted animate-pulse">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-muted rounded flex-1"></div>
                  <div className="h-9 bg-muted rounded flex-1"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
```

**Contador de Productos Restaurables**

[Líneas 147-154](CategoryRecycleBin.tsx#L147-L154)

```typescript
{category.restorable_products_count !== undefined &&
 category.restorable_products_count > 0 && (
  <div className="flex items-center gap-1">
    <Package className="h-4 w-4 text-green-600" />
    <span className="text-green-600 font-medium">
      {category.restorable_products_count} productos serán restaurados
    </span>
  </div>
)}
```

**Alerta Descriptiva**

[Líneas 105-112](CategoryRecycleBin.tsx#L105-L112)

```typescript
<Alert>
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>
    <strong>Restaurar:</strong> Los productos originales volverán automáticamente a esta categoría.
    <br />
    <strong>Eliminar permanentemente:</strong> Los productos pendientes de restaurar quedarán en "Otros".
  </AlertDescription>
</Alert>
```

### 6. Hook: useCategoriesAdmin.ts

**Exportar `deletedCount` del contexto**

```typescript
export const useCategoriesAdmin = () => {
  const {
    categories,
    loading,
    deletedCount, // ⭐ Agregado del contexto
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    forceDeleteCategory,
    reorderCategories,
    refreshDeletedCount,
  } = useCategories();

  // ... lógica del hook ...

  return {
    // Data
    categories,
    pendingCategories,
    loading,
    hasUnsavedChanges,
    deletedCount, // ⭐ Exportado para AdminCategories

    // ... resto de retorno ...
  };
};
```

### 7. Página: AdminCategories.tsx

**Uso de `deletedCount` y Lazy Loading**

```typescript
const {
  categories,
  loading,
  deletedCount, // ⭐ Del hook useCategoriesAdmin
  // ... otros ...
} = useCategoriesAdmin();

const {
  deletedCategories,
  handleRestore,
  handleForceDelete,
  isLoading: recycleBinLoading,
} = useCategoryRecycleBin({ isVisible: showRecycleBin }); // ⭐ Lazy loading

// Badge con contador optimista
<Button
  variant="outline"
  onClick={() => setShowRecycleBin(!showRecycleBin)}
  className="gap-2"
>
  <Trash2 className="h-4 w-4" />
  Papelera de Reciclaje
  {deletedCount > 0 && (
    <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
      {deletedCount}
    </Badge>
  )}
</Button>
```

---

## Sistema de Restauración Inteligente

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ELIMINAR CATEGORÍA (Soft Delete)                        │
├─────────────────────────────────────────────────────────────┤
│ Categoría: "Electrónica" (id: 5)                           │
│ Productos: [Laptop, Mouse, Teclado]                        │
│                                                             │
│ ANTES:                                                      │
│   product.category_id = 5                                  │
│   product.original_category_id = null                      │
│                                                             │
│ DESPUÉS:                                                    │
│   product.category_id = 1 (Otros)                          │
│   product.original_category_id = 5  ⭐                      │
│                                                             │
│ category.deleted_at = "2025-11-21 10:00:00"               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. RESTAURAR CATEGORÍA                                      │
├─────────────────────────────────────────────────────────────┤
│ Categoría: "Electrónica" (id: 5)                           │
│                                                             │
│ QUERY:                                                      │
│   SELECT * FROM products                                    │
│   WHERE original_category_id = 5                           │
│                                                             │
│ RESULTADO: [Laptop, Mouse, Teclado]                        │
│                                                             │
│ UPDATE:                                                     │
│   product.category_id = 5  ⭐                               │
│   product.original_category_id = null                      │
│                                                             │
│ category.deleted_at = null                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. EDGE CASE: Cambio Manual de Categoría                   │
├─────────────────────────────────────────────────────────────┤
│ Usuario mueve "Mouse" manualmente a "Accesorios" (id: 8)   │
│                                                             │
│ ANTES:                                                      │
│   product.category_id = 1 (Otros)                          │
│   product.original_category_id = 5                         │
│                                                             │
│ DESPUÉS:                                                    │
│   product.category_id = 8 (Accesorios)                     │
│   product.original_category_id = null  ⭐                   │
│                                                             │
│ Si ahora se restaura "Electrónica":                        │
│   - Laptop y Teclado vuelven a "Electrónica"              │
│   - Mouse permanece en "Accesorios" ✅                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. ELIMINACIÓN PERMANENTE (Force Delete)                   │
├─────────────────────────────────────────────────────────────┤
│ Categoría: "Electrónica" (id: 5)                           │
│                                                             │
│ PASO 1: Reasignar productos actuales (si hay)              │
│   UPDATE products                                           │
│   SET category_id = 1                                       │
│   WHERE category_id = 5                                     │
│                                                             │
│ PASO 2: Limpiar referencias huérfanas  ⭐                   │
│   UPDATE products                                           │
│   SET original_category_id = null                          │
│   WHERE original_category_id = 5                           │
│                                                             │
│ PASO 3: Eliminación física                                 │
│   DELETE FROM categories WHERE id = 5                       │
│                                                             │
│ RESULTADO:                                                  │
│   - Productos permanecen en "Otros"                        │
│   - No quedan referencias a categoría eliminada            │
└─────────────────────────────────────────────────────────────┘
```

### Casos de Uso

#### Caso 1: Restauración Normal

```sql
-- Categoría eliminada con 10 productos
DELETE (soft) FROM categories WHERE id = 5;

-- Productos quedan en "Otros" con referencia
UPDATE products SET
  category_id = 1,
  original_category_id = 5
WHERE category_id = 5;

-- Usuario restaura categoría
RESTORE categories WHERE id = 5;

-- Productos vuelven automáticamente
UPDATE products SET
  category_id = 5,
  original_category_id = NULL
WHERE original_category_id = 5;

-- ✅ Resultado: 10 productos restaurados
```

#### Caso 2: Cambio Manual + Restauración

```sql
-- Categoría eliminada con 5 productos
DELETE (soft) FROM categories WHERE id = 5;

-- Productos a "Otros"
UPDATE products SET
  category_id = 1,
  original_category_id = 5
WHERE category_id = 5;

-- Usuario mueve 2 productos manualmente a categoría 8
UPDATE products SET
  category_id = 8,
  original_category_id = NULL  -- ⭐ Se limpia la referencia
WHERE id IN (101, 102);

-- Usuario restaura categoría 5
RESTORE categories WHERE id = 5;

-- Solo 3 productos vuelven (los que no se movieron)
UPDATE products SET
  category_id = 5,
  original_category_id = NULL
WHERE original_category_id = 5;

-- ✅ Resultado: 3 productos restaurados, 2 permanecen en categoría 8
```

#### Caso 3: Force Delete con Referencias

```sql
-- Categoría eliminada con 8 productos esperando
DELETE (soft) FROM categories WHERE id = 5;

-- 8 productos en "Otros" con original_category_id = 5
-- Usuario decide eliminar permanentemente la categoría

-- Paso 1: Limpiar referencias
UPDATE products SET original_category_id = NULL
WHERE original_category_id = 5;

-- Paso 2: Eliminación física
DELETE FROM categories WHERE id = 5;

-- ✅ Resultado: 8 productos permanecen en "Otros", sin referencias huérfanas
```

---

## Endpoints de API

### Rutas Públicas

#### `GET /api/v1/categories`
Listar categorías activas con jerarquía

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Electrónica",
    "slug": "electronica",
    "description": "Productos electrónicos",
    "parent_id": null,
    "level": 0,
    "order": 0,
    "is_protected": false,
    "is_active": true,
    "products_count": 15,
    "children": [
      {
        "id": 2,
        "name": "Laptops",
        "parent_id": 1,
        "level": 1,
        "products_count": 5
      }
    ],
    "created_at": "2025-11-20T10:00:00.000000Z",
    "updated_at": "2025-11-20T10:00:00.000000Z"
  }
]
```

#### `GET /api/v1/categories/{id}`
Obtener categoría específica con productos

**Respuesta:**
```json
{
  "id": 1,
  "name": "Electrónica",
  "slug": "electronica",
  "description": "Productos electrónicos",
  "parent_id": null,
  "level": 0,
  "order": 0,
  "is_protected": false,
  "is_active": true,
  "products_count": 15,
  "children": [...],
  "products": [
    {
      "id": 101,
      "name": "Laptop Dell",
      "category_id": 1,
      "original_category_id": null
    }
  ],
  "created_at": "2025-11-20T10:00:00.000000Z",
  "updated_at": "2025-11-20T10:00:00.000000Z"
}
```

### Rutas Protegidas (Super Admin)

#### `POST /api/v1/categories`
Crear nueva categoría

**Request:**
```json
{
  "name": "Electrónica",
  "description": "Productos electrónicos",
  "parent_id": null,
  "level": 0,
  "order": 0,
  "is_active": true
}
```

**Respuesta:**
```json
{
  "message": "Categoría creada exitosamente",
  "category": {
    "id": 5,
    "name": "Electrónica",
    "slug": "electronica",
    ...
  }
}
```

#### `PUT /api/v1/categories/{id}`
Actualizar categoría existente

**Request:**
```json
{
  "name": "Electrónica y Tecnología",
  "description": "Productos electrónicos y tecnológicos"
}
```

#### `DELETE /api/v1/categories/{id}`
Eliminar categoría (soft delete)

**Respuesta:**
```json
{
  "message": "Categoría eliminada exitosamente",
  "productos_reasignados": 10
}
```

#### `POST /api/v1/categories/{id}/restore`
Restaurar categoría eliminada

**Respuesta:**
```json
{
  "message": "Categoría restaurada exitosamente",
  "category": {...},
  "productos_restaurados": 10
}
```

#### `DELETE /api/v1/categories/{id}/force`
Eliminar permanentemente

**Respuesta:**
```json
{
  "message": "Categoría eliminada permanentemente de forma exitosa",
  "productos_reasignados": 3,
  "referencias_limpiadas": 10
}
```

#### `GET /api/v1/categories/recycle-bin`
Obtener categorías eliminadas

**Respuesta:**
```json
[
  {
    "id": 5,
    "name": "Electrónica",
    "slug": "electronica",
    "deleted_at": "2025-11-21T10:00:00.000000Z",
    "products_count": 3,
    "restorable_products_count": 10,
    "parent": null
  }
]
```

#### `PUT /api/v1/categories/reorder`
Reordenar múltiples categorías

**Request:**
```json
{
  "categories": [
    { "id": 1, "order": 0 },
    { "id": 2, "order": 1 },
    { "id": 3, "order": 2 }
  ]
}
```

---

## Flujo de Datos

### 1. Eliminación de Categoría

```
┌─────────────┐
│   Usuario   │
│  (Frontend) │
└──────┬──────┘
       │ Click "Eliminar"
       │
       ▼
┌─────────────────────────────────────┐
│ useCategoriesAdmin.handleDelete()   │
│ - Mostrar confirmación              │
└──────┬──────────────────────────────┘
       │ Confirmar
       ▼
┌─────────────────────────────────────┐
│ CategoriesContext.deleteCategory()  │
│ - setDeletedCount(prev => prev + 1) │ ⭐ Actualización optimista
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ categoriesService.delete(id)        │
│ - DELETE /api/v1/categories/{id}    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ CategoryController.destroy()                        │
│ 1. Validar no sea categoría protegida              │
│ 2. Obtener categoría "Otros"                       │
│ 3. products.update({                               │
│      original_category_id: id,                     │ ⭐
│      category_id: otherCategory.id                 │
│    })                                              │
│ 4. category.delete() // Soft delete                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Base de Datos PostgreSQL            │
│ - categories.deleted_at = NOW()     │
│ - products.category_id = 1          │
│ - products.original_category_id = 5 │ ⭐
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Frontend recibe respuesta success   │
│ - syncWithAPI() refresca datos      │
│ - Toast de éxito                    │
│ - Badge muestra contador inmediato  │ ⭐
└─────────────────────────────────────┘
```

### 2. Restauración de Categoría

```
┌─────────────┐
│   Usuario   │
│  (Frontend) │
└──────┬──────┘
       │ Abre papelera
       │
       ▼
┌─────────────────────────────────────┐
│ useCategoryRecycleBin               │
│ - useEffect detecta isVisible=true  │ ⭐ Lazy loading
│ - loadDeletedCategories()           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ categoriesService.getRecycleBin()   │
│ - GET /api/v1/categories/recycle-bin│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ CategoryController.recycleBin()                     │
│ - Category::onlyTrashed()                          │
│ - each(category => {                               │
│     restorable_products_count =                    │ ⭐
│       Product::where('original_category_id', id)   │
│              ->count()                             │
│   })                                               │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ CategoryRecycleBin Component        │
│ - Mostrar skeleton mientras carga   │ ⭐
│ - Mostrar categorías eliminadas     │
│ - Badge de productos restaurables   │ ⭐
└──────┬──────────────────────────────┘
       │ Usuario click "Restaurar"
       ▼
┌─────────────────────────────────────┐
│ useCategoryRecycleBin.handleRestore │
│ - Confirmación (opcional)           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ CategoriesContext.restoreCategory() │
│ - setDeletedCount(prev => prev - 1) │ ⭐ Actualización optimista
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ categoriesService.restore(id)       │
│ - POST /api/v1/categories/{id}/restore │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ CategoryController.restore()                        │
│ 1. category.restore()                              │
│ 2. Product::where('original_category_id', id)      │ ⭐
│    ->update({                                      │
│      category_id: id,                              │
│      original_category_id: null                    │
│    })                                              │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Base de Datos PostgreSQL            │
│ - categories.deleted_at = NULL      │
│ - products.category_id = 5          │ ⭐ Restaurados
│ - products.original_category_id = NULL│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Frontend recibe respuesta success   │
│ - loadDeletedCategories() recarga   │
│ - syncWithAPI() refresca categorías │
│ - Toast de éxito con contador       │
│ - Badge actualizado inmediatamente  │ ⭐
└─────────────────────────────────────┘
```

---

## Checklist de Pruebas

### Backend

- [ ] **Migración de `original_category_id`**
  - [ ] Ejecutar migración sin errores
  - [ ] Foreign key constraint creado correctamente
  - [ ] Index en `original_category_id` funcional

- [ ] **Soft Delete de Categoría**
  - [ ] Categoría se marca con `deleted_at`
  - [ ] Productos se reasignan a "Otros"
  - [ ] `original_category_id` se guarda correctamente
  - [ ] No se puede eliminar categoría protegida "Otros"
  - [ ] Error 403 si se intenta eliminar categoría protegida
  - [ ] Error 500 si no existe categoría "Otros"

- [ ] **Restauración de Categoría**
  - [ ] Categoría se restaura (`deleted_at = null`)
  - [ ] Productos con `original_category_id` vuelven
  - [ ] `original_category_id` se limpia después de restaurar
  - [ ] Contador de productos restaurados es correcto

- [ ] **Force Delete**
  - [ ] Categoría se elimina permanentemente
  - [ ] Productos actuales se reasignan a "Otros"
  - [ ] Referencias de `original_category_id` se limpian
  - [ ] Contadores de reasignación y limpieza correctos

- [ ] **Endpoint de Papelera**
  - [ ] Solo retorna categorías con soft delete
  - [ ] Incluye padres aunque estén eliminados
  - [ ] `restorable_products_count` es correcto
  - [ ] Orden por `deleted_at` descendente

- [ ] **Actualización de Productos**
  - [ ] Cambio manual de categoría limpia `original_category_id`
  - [ ] Productos no vuelven a categoría eliminada si se movieron

- [ ] **Orden de Rutas**
  - [ ] `/categories/recycle-bin` funciona sin error 500
  - [ ] `/categories/reorder` funciona correctamente
  - [ ] Rutas específicas antes de `{id}`

### Frontend

- [ ] **Tipos TypeScript**
  - [ ] Interface `Category` incluye `restorable_products_count`
  - [ ] Tipos de DTO actualizados

- [ ] **Servicio**
  - [ ] `getRecycleBin()` llama al endpoint correcto
  - [ ] Transformación de datos Laravel funcional

- [ ] **Contexto**
  - [ ] `deletedCount` se actualiza optimistamente al eliminar
  - [ ] `deletedCount` se decrementa al restaurar/force delete
  - [ ] `refreshDeletedCount()` recarga correctamente
  - [ ] Rollback en caso de error funciona

- [ ] **Hook useCategoryRecycleBin**
  - [ ] Lazy loading funciona (solo carga al abrir)
  - [ ] `isVisible` trigger funcional
  - [ ] `handleRestore()` recarga datos después de éxito
  - [ ] `handleForceDelete()` recarga datos después de éxito
  - [ ] Toasts de error/éxito se muestran correctamente

- [ ] **Componente CategoryRecycleBin**
  - [ ] Skeleton loading mientras carga primera vez
  - [ ] Empty state cuando no hay categorías eliminadas
  - [ ] Badge de "Eliminada" visible
  - [ ] Contador de productos restaurables correcto
  - [ ] Alerta descriptiva clara
  - [ ] Botones de Restaurar/Eliminar permanentemente funcionan
  - [ ] Subcategorías se muestran en lista

- [ ] **Página AdminCategories**
  - [ ] Badge de papelera muestra contador correcto
  - [ ] Badge actualiza inmediatamente al eliminar
  - [ ] Lazy loading al abrir papelera funciona
  - [ ] Dialog/Sheet de papelera se abre correctamente

### Pruebas End-to-End

- [ ] **Flujo Completo: Eliminar → Restaurar**
  1. Categoría con 5 productos
  2. Eliminar categoría
  3. Verificar productos en "Otros"
  4. Verificar badge incrementa a 1
  5. Abrir papelera
  6. Verificar contador de 5 productos restaurables
  7. Restaurar categoría
  8. Verificar 5 productos vuelven
  9. Verificar badge decrementa a 0

- [ ] **Flujo Completo: Eliminar → Mover Manual → Restaurar**
  1. Categoría "A" con 3 productos
  2. Eliminar categoría "A"
  3. Productos a "Otros"
  4. Mover 1 producto manualmente a categoría "B"
  5. Restaurar categoría "A"
  6. Verificar 2 productos en "A"
  7. Verificar 1 producto permanece en "B"

- [ ] **Flujo Completo: Eliminar → Force Delete**
  1. Categoría con 3 productos
  2. Eliminar categoría
  3. Verificar badge incrementa
  4. Abrir papelera
  5. Force delete
  6. Verificar productos permanecen en "Otros"
  7. Verificar badge decrementa
  8. Verificar no quedan referencias huérfanas

---

## Optimizaciones de Rendimiento

### 1. Lazy Loading de Papelera

**Problema:** Cargar todas las categorías eliminadas al inicio ralentiza la carga inicial.

**Solución:**
```typescript
// Solo cargar contador al inicio (desde contexto)
const [deletedCount, setDeletedCount] = useState(0);

// Cargar datos completos cuando se abre la papelera
useEffect(() => {
  if (isVisible) {
    loadDeletedCategories();
  }
}, [isVisible]);
```

**Beneficio:**
- Carga inicial más rápida
- Datos frescos al abrir papelera
- Mejor UX con skeleton loading

### 2. Actualizaciones Optimistas

**Problema:** Esperar respuesta del servidor para actualizar UI crea delay perceptible.

**Solución:**
```typescript
const deleteCategory = async (id: string) => {
  setDeletedCount(prev => prev + 1); // ⭐ Actualizar ANTES de llamar API

  try {
    await categoriesService.delete(id);
    await syncWithAPI();
  } catch (error) {
    await refreshDeletedCount(); // Revertir en error
    throw error;
  }
};
```

**Beneficio:**
- Badge actualiza instantáneamente
- UX percibida como "instantánea"
- Rollback automático en errores

### 3. Índices en Base de Datos

**Problema:** Queries de restauración pueden ser lentas con muchos productos.

**Solución:**
```php
// En migración
$table->index('original_category_id');
```

**Beneficio:**
- Query `WHERE original_category_id = ?` optimizada
- Restauración rápida incluso con miles de productos

### 4. Eager Loading de Relaciones

**Problema:** N+1 queries al cargar categorías con hijos.

**Solución:**
```php
// En CategoryController.index()
$categories = Category::with('children')
    ->whereNull('parent_id')
    ->active()
    ->ordered()
    ->withCount('products')
    ->get();
```

**Beneficio:**
- 2 queries en lugar de N+1
- Carga significativamente más rápida

### 5. Skeleton Loading

**Problema:** Pantalla vacía mientras carga crea percepción de lentitud.

**Solución:**
```typescript
if (isLoading && deletedCategories.length === 0) {
  return <SkeletonLoader />;
}
```

**Beneficio:**
- Usuario sabe que algo está cargando
- Mejor UX percibida
- Reducción de bounce rate

### 6. Batch Updates en Reorder

**Problema:** Actualizar orden de categorías una por una es ineficiente.

**Solución:**
```php
// En CategoryController.reorder()
foreach ($request->categories as $item) {
    Category::where('id', $item['id'])
        ->update(['order' => $item['order']]);
}
```

**Beneficio:**
- Transacción única
- Rollback automático en errores
- Consistencia de datos garantizada

---

## Notas Finales

### ⚠️ Cosas a NO Hacer

1. **NO definir rutas específicas después de `{id}`**
   - Laravel interpretará "recycle-bin" como un ID
   - Resultado: Error 500 "invalid input syntax for type bigint"

2. **NO olvidar limpiar `original_category_id` en force delete**
   - Resultado: Referencias huérfanas en la base de datos
   - Violaciones de integridad referencial potenciales

3. **NO actualizar badge sin optimistic updates**
   - Resultado: Delay perceptible que empeora UX
   - Usuario piensa que la acción no funcionó

4. **NO cargar datos de papelera al inicio**
   - Resultado: Carga inicial lenta innecesaria
   - Desperdicio de ancho de banda

5. **NO omitir `onDelete('set null')` en foreign key**
   - Resultado: Errores al eliminar categorías
   - Pérdida de integridad referencial

### ✅ Mejores Prácticas

1. **Siempre validar categoría protegida antes de eliminar**
2. **Siempre usar actualizaciones optimistas para contadores**
3. **Siempre implementar skeleton loading para UX**
4. **Siempre limpiar `original_category_id` en cambios manuales**
5. **Siempre recargar datos después de restaurar/force delete**
6. **Siempre mostrar toasts descriptivos con contadores**

### 🚀 Mejoras Futuras Sugeridas

1. **Auto-eliminación después de 30 días**
   - Scheduled job en Laravel
   - Notificación antes de auto-eliminación

2. **Historial de cambios**
   - Auditoría de restauraciones
   - Log de force deletes

3. **Búsqueda en papelera**
   - Filtrar categorías eliminadas
   - Búsqueda por fecha de eliminación

4. **Exportación de datos**
   - CSV de categorías eliminadas
   - Reporte de productos reasignados

5. **Confirmación mejorada**
   - Preview de productos afectados
   - Confirmación de dos pasos para force delete

---

**Última actualización:** 2025-11-21
**Versión:** 1.0
**Estado:** ✅ Completamente Funcional
