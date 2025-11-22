# Integración del Sistema de Productos

## Tabla de Contenidos
- [Resumen General](#resumen-general)
- [Arquitectura](#arquitectura)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Endpoints de API](#endpoints-de-api)
- [Componentes Frontend](#componentes-frontend)
- [Header y Navegación](#header-y-navegación)
- [Autenticación y Modo Invitado](#autenticación-y-modo-invitado)
- [Archivos Modificados](#archivos-modificados)

---

## Resumen General

Documentación de la integración del sistema de Productos entre el frontend React/TypeScript y el backend Laravel, incluyendo:

- ✅ **CRUD completo de productos** con Laravel backend
- ✅ **Subida de imágenes** con FormData y multipart/form-data
- ✅ **Papelera de reciclaje** con lazy loading y skeleton states
- ✅ **Eliminación suave (Soft Delete)** y restauración
- ✅ **Badge de papelera** con contador optimista
- ✅ **Header responsive** con dropdowns para categorías
- ✅ **Sistema de autenticación** con modo invitado
- ✅ **Wishlist con badge** de contador

---

## Arquitectura

### Stack Tecnológico

**Backend:**
- Laravel 10+
- PostgreSQL
- Sanctum (autenticación)
- Spatie (roles y permisos)
- Storage para imágenes

**Frontend:**
- React 18 + TypeScript
- Context API (estado global)
- Axios (peticiones HTTP)
- Shadcn UI (componentes)
- TailwindCSS

### Estructura de Archivos

```
src/features/products/
├── components/
│   ├── ProductRecycleBin.tsx      # Papelera de productos
│   └── ...
├── contexts/
│   └── ProductsContext.tsx        # Estado global de productos
├── hooks/
│   ├── useProductsAdmin.ts        # Lógica admin CRUD
│   └── useProductRecycleBin.ts    # Lógica papelera
├── services/
│   └── products.service.ts        # Llamadas API
└── types/
    └── index.ts                   # DTOs y tipos
```

---

## Funcionalidades Implementadas

### 1. Subida de Imágenes

**Problema resuelto:** Error "The image field must be an image"

**Solución:**
- Uso de `CreateProductDto` y `UpdateProductDto` con `image?: File`
- Header explícito `Content-Type: multipart/form-data` en axios
- FormData para envío de archivos

```typescript
// products.service.ts
const response = await api.post(API_ENDPOINTS.PRODUCTS, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### 2. Papelera de Reciclaje (Lazy Loading)

**Características:**
- Carga solo cuando se abre el panel
- Skeleton states durante carga
- Auto-refresh cuando se elimina un producto
- Badge con contador optimista

```typescript
// useProductRecycleBin.ts
useEffect(() => {
  if (isVisible) {
    if (!hasLoadedOnce || deletedCount !== deletedProducts.length) {
      loadDeletedProducts();
    }
  }
}, [isVisible, deletedCount]);
```

### 3. Diálogos de Confirmación

- Restaurar producto
- Eliminar permanentemente
- Reutilización del componente AlertDialog

### 4. Protección de Endpoints

Los contextos verifican autenticación antes de llamar endpoints protegidos:

```typescript
// ProductsContext.tsx
const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
if (token) {
  const deletedResult = await productsService.getDeleted();
  setDeletedCount(deletedResult.data.length);
}
```

---

## Endpoints de API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/products` | Listar productos | No |
| POST | `/api/v1/products` | Crear producto | Sí |
| PUT | `/api/v1/products/{id}` | Actualizar producto | Sí |
| DELETE | `/api/v1/products/{id}` | Soft delete | Sí |
| GET | `/api/v1/products/recycle-bin` | Productos eliminados | Sí |
| POST | `/api/v1/products/{id}/restore` | Restaurar producto | Sí |
| DELETE | `/api/v1/products/{id}/force` | Eliminar permanente | Sí |

---

## Componentes Frontend

### Header Responsive

**Mejoras implementadas:**

1. **Dropdowns de categorías** con CSS puro (`group` hover)
2. **Menú de perfil** con opciones según autenticación
3. **Badge de wishlist** con contador
4. **Badge de carrito** existente
5. **Menú móvil** con scroll y todas las opciones

### Dropdowns con CSS Hover

```tsx
<div className="relative group">
  <Link to={`/category/${category.slug}`}>
    {category.name}
    <ChevronDown />
  </Link>
  <div className="absolute left-0 top-full pt-2 opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible transition-all">
    {/* Subcategorías */}
  </div>
</div>
```

---

## Header y Navegación

### Estructura del Header

```
┌─────────────────────────────────────────────────────────────┐
│ LOGO    [Categorías con dropdowns]    🔍 ❤️ 👤 🛡️ 🛒      │
└─────────────────────────────────────────────────────────────┘
```

### Iconos y Badges

| Icono | Función | Badge |
|-------|---------|-------|
| 🔍 Search | Abre diálogo de búsqueda | - |
| ❤️ Heart | Link a Wishlist | Rojo (cantidad) |
| 👤 User | Dropdown perfil/login | - |
| 🛡️ Shield | Link a Admin (solo admins) | - |
| 🛒 Cart | Link a Carrito | Naranja (cantidad) |

### Menú Móvil

- Altura máxima con scroll: `max-h-[calc(100vh-80px)] overflow-y-auto`
- Categorías con subcategorías expandidas
- Sección de usuario al final (Favoritos, Mi Cuenta, Admin, Cerrar Sesión)

---

## Autenticación y Modo Invitado

### Estados de Usuario

| Estado | Header Desktop | Header Móvil |
|--------|----------------|--------------|
| **Invitado** | Dropdown: "Iniciar Sesión" | "Iniciar Sesión" |
| **Cliente** | Dropdown: "Mi Perfil", "Cerrar Sesión" | Mi Cuenta, Cerrar Sesión |
| **Admin** | + Icono Shield visible | + Link Admin |

### Verificación de Autenticación

```typescript
const { isAdmin, logout, isAuthenticated } = useAuth();

// Mostrar Admin solo si es admin
{isAdmin() && (
  <Link to="/admin">
    <Shield size={22} />
  </Link>
)}

// Mostrar opciones según autenticación
{isAuthenticated ? (
  // Mi Perfil + Cerrar Sesión
) : (
  // Iniciar Sesión
)}
```

### Logout Funcional

```typescript
const handleLogout = async () => {
  await logout(); // Llama al backend, limpia localStorage
  navigate('/auth');
};
```

---

## Archivos Modificados

### Frontend

| Archivo | Cambios |
|---------|---------|
| `ProductsContext.tsx` | Verificación de token antes de recycle-bin |
| `CategoriesContext.tsx` | Verificación de token antes de recycle-bin |
| `OrdersContext.tsx` | Verificación de token antes de cargar órdenes |
| `products.service.ts` | Header multipart/form-data para uploads |
| `useProductsAdmin.ts` | Uso de DTOs correctos |
| `useProductRecycleBin.ts` | Dependencia de deletedCount para auto-refresh |
| `Header.tsx` | Dropdowns, badges, modo invitado, menú móvil |
| `navigation-menu.tsx` | Ajuste de viewport position |

### Backend

| Archivo | Cambios |
|---------|---------|
| `CategoryController.php` | forceDelete con manejo de subcategorías |

---

## Checklist de Pruebas

### Productos
- [ ] Crear producto con imagen
- [ ] Editar producto y cambiar imagen
- [ ] Eliminar producto (soft delete)
- [ ] Ver papelera con productos eliminados
- [ ] Restaurar producto desde papelera
- [ ] Eliminar permanentemente producto
- [ ] Badge de papelera se actualiza automáticamente

### Header
- [ ] Dropdowns de categorías funcionan en desktop
- [ ] Menú móvil muestra todas las opciones
- [ ] Scroll funciona en menú móvil largo
- [ ] Badge de wishlist aparece al agregar favorito
- [ ] Badge de carrito funciona
- [ ] Dropdown de perfil muestra opciones correctas
- [ ] Logout cierra sesión y redirige a /auth
- [ ] Admin icon solo visible para admins

### Modo Invitado
- [ ] No hay errores 401 en consola
- [ ] Productos se cargan normalmente
- [ ] Categorías se cargan normalmente
- [ ] Wishlist funciona (localStorage)
- [ ] Carrito funciona (localStorage)
- [ ] "Iniciar Sesión" aparece en dropdown

---

## Notas Importantes

1. **Wishlist en localStorage**: Los favoritos persisten entre sesiones y usuarios en el mismo navegador. Es comportamiento estándar de e-commerce.

2. **Imágenes**: Se guardan en `public/storage/products` en el backend Laravel.

3. **Errores 401**: Solucionados verificando token antes de llamar endpoints protegidos.

4. **Categoría "Otros"**: Los productos de categorías eliminadas se reasignan automáticamente.
