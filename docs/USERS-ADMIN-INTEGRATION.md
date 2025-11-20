# Integración de Gestión de Usuarios Admin/Moderador

**Fecha:** 2025-11-19
**Estado:** ✅ Completado

## Descripción

Integración completa del sistema de gestión de usuarios Admin y Moderador entre el frontend (React/TypeScript) y el backend (Laravel).

## Roles del Sistema

### Backend (Laravel)
- **Super Admin**: Máximo nivel de permisos, puede crear/editar/eliminar usuarios
- **Moderador**: Permisos limitados de administración
- **Cliente**: Usuario final (se registra públicamente, NO se gestiona aquí)

### Frontend (React)
- **admin**: Mapeado desde "Super Admin"
- **moderador**: Mapeado desde "Moderador"
- **cliente**: Mapeado desde "Cliente"

## Endpoints Integrados

### 1. Listar Usuarios Admin/Moderador
```
GET /api/v1/users
```
**Middleware:** `auth:sanctum`, `role:Super Admin`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin Usuario",
        "email": "admin@example.com",
        "phone": null,
        "role": "Super Admin",
        "permissions": ["view_products", "create_products", ...],
        "email_verified_at": "2024-01-01T00:00:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. Crear Usuario Admin/Moderador
```
POST /api/v1/users
```
**Middleware:** `auth:sanctum`, `role:Super Admin`

**Body:**
```json
{
  "name": "Nuevo Admin",
  "email": "nuevo@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "Super Admin" // o "Moderador"
}
```

**Validaciones Backend:**
- Solo Super Admin puede crear usuarios
- Solo puede crear roles "Super Admin" o "Moderador" (NO "Cliente")
- Email debe ser único
- Password mínimo 8 caracteres con confirmación

### 3. Obtener Usuario Específico
```
GET /api/v1/users/{id}
```
**Middleware:** `auth:sanctum`, `role:Super Admin`

### 4. Actualizar Usuario
```
PUT /api/v1/users/{id}
```
**Middleware:** `auth:sanctum`, `role:Super Admin`

**Body (todos opcionales):**
```json
{
  "name": "Nombre Actualizado",
  "email": "actualizado@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "role": "Moderador"
}
```

**Validaciones Backend:**
- No puede cambiar su propio rol
- No puede cambiar el rol del último Super Admin
- Password es opcional (solo si se desea cambiar)

### 5. Eliminar Usuario
```
DELETE /api/v1/users/{id}
```
**Middleware:** `auth:sanctum`, `role:Super Admin`

**Validaciones Backend:**
- No puede eliminarse a sí mismo
- No puede eliminar el último Super Admin del sistema

## Archivos Modificados/Creados

### Frontend

#### 1. Tipos Actualizados
**Archivo:** `src/features/auth/types/user.types.ts`
- Agregado rol `'moderador'` a `UserProfile.role`
- Actualizado `AdminProfile` para soportar `'admin' | 'moderador'`

#### 2. Transformers
**Archivo:** `src/features/auth/utils/transformers.ts`
- ✅ `mapLaravelRoleToFrontend()`: Mapea roles de Laravel → Frontend
  - "Super Admin" → "admin"
  - "Moderador" → "moderador"
  - "Cliente" → "cliente"

- ✅ `mapFrontendRoleToLaravel()`: Mapea roles de Frontend → Laravel
  - "admin" → "Super Admin"
  - "moderador" → "Moderador"
  - "cliente" → "Cliente"

#### 3. Componente de Confirmación (Reutilizado)
**Archivo:** `src/components/common/DeleteConfirmDialog.tsx`
- ✅ Agregado tipo `'user'` al enum `itemType`
- ✅ Agregado label `'usuario'` para mensajes en español
- ✅ Componente reutilizable para confirmación de eliminación con UI profesional

#### 4. Servicio de Usuarios
**Archivo:** `src/features/admin-users/services/users.service.ts`

**Cambios:**
- ❌ **ELIMINADO:** Todo el código mock (datos temporales)
- ✅ **AGREGADO:** Integración completa con API Laravel

**Funciones:**
```typescript
// Listar todos los usuarios Admin/Moderador
usersService.getAdmins(): Promise<ApiResponse<AdminProfile[]>>

// Obtener usuario por ID
usersService.getUserById(userId: string): Promise<ApiResponse<AdminProfile>>

// Crear nuevo usuario
usersService.createAdmin(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'moderador';
}): Promise<ApiResponse<AdminProfile>>

// Actualizar usuario
usersService.updateAdmin(userId: string, data: {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: 'admin' | 'moderador';
}): Promise<ApiResponse<AdminProfile>>

// Eliminar usuario
usersService.deleteAdmin(userId: string): Promise<ApiResponse<void>>
```

#### 5. Validaciones
**Archivo:** `src/features/admin-users/validations/admin.validation.ts`

**Schemas Zod:**
- `createAdminSchema`: Para crear usuarios (password OBLIGATORIO con confirmación)
- `updateAdminSchema`: Para actualizar usuarios (todos los campos opcionales)
- Validación de coincidencia de contraseñas con `.refine()`

#### 6. Hook useUsersAdmin (Actualizado)
**Archivo:** `src/features/admin-users/hooks/useUsersAdmin.ts`

**Nuevas funcionalidades para eliminación:**
- ✅ Estado `deleteDialogOpen`: Controla visibilidad del modal de confirmación
- ✅ Estado `adminToDelete`: Almacena ID y nombre del usuario a eliminar
- ✅ `handleDeleteAdmin(id)`: Abre el modal de confirmación con datos del usuario
- ✅ `confirmDeleteAdmin()`: Ejecuta la eliminación tras confirmación del usuario
- ❌ **ELIMINADO:** `window.confirm()` - Reemplazado por modal profesional

**Beneficios:**
- UI/UX mejorada con modal profesional
- Confirmación visual clara antes de eliminar
- Manejo de errores con mensajes toast traducidos al español
- Detección específica de error 403 (sin permisos) con mensaje descriptivo
- Actualización automática de lista tras eliminación

**Manejo de errores mejorado:**
```typescript
// Detecta y traduce errores del backend
if (errorMessage.includes('does not have the right roles') || error.response?.status === 403) {
  description = 'No tienes permisos para gestionar usuarios. Solo los Super Admin pueden crear/editar/eliminar administradores.';
}
```

#### 7. Página AdminUsers (Actualizada)
**Archivo:** `src/pages/AdminUsers.tsx`

**Cambios:**
- ✅ Importado `DeleteConfirmDialog` de `@/components/common`
- ✅ Integrado estados del hook (`deleteDialogOpen`, `adminToDelete`)
- ✅ Agregado componente `DeleteConfirmDialog` al JSX
- ❌ **ELIMINADO:** Sección de Clientes (ClientsList) - Fuera de scope

#### 8. AuthContext (Corregido - IMPORTANTE)
**Archivo:** `src/features/auth/contexts/AuthContext.tsx`

**Problema identificado:**
- ❌ La función `isAdmin()` solo verificaba `role === 'admin'`
- ❌ Los usuarios Moderador no podían acceder al panel admin

**Solución aplicada:**
```typescript
// ✅ ANTES (incorrecto):
const isAdmin = (): boolean => {
  return state.user?.role === 'admin';
};

// ✅ DESPUÉS (correcto):
const isAdmin = (): boolean => {
  return state.user?.role === 'admin' || state.user?.role === 'moderador';
};
```

**Impacto:**
- ✅ Ahora Moderadores pueden acceder al panel admin (`/admin/*`)
- ✅ `ProtectedRoute` con `requireAdmin` permite ambos roles
- ✅ Consistente con permisos del backend Laravel

### Backend

**Archivos existentes (sin modificaciones):**
- `routes/v1/users.php`: Rutas protegidas con middleware
- `app/Http/Controllers/Api/v1/UserController.php`: Controlador completo
- `app/Http/Requests/v1/StoreUserRequest.php`: Validaciones de creación
- `app/Http/Requests/v1/UpdateUserRequest.php`: Validaciones de actualización

## Flujo de Datos

### Crear Usuario Admin/Moderador

1. **Frontend:** Usuario llena formulario con rol "admin" o "moderador"
2. **Frontend:** Valida datos con `createAdminSchema` (Zod)
3. **Frontend:** Convierte rol usando `mapFrontendRoleToLaravel()`
   - "admin" → "Super Admin"
   - "moderador" → "Moderador"
4. **Frontend:** Envía POST a `/api/v1/users` con Bearer token
5. **Backend:** Middleware verifica que usuario sea "Super Admin"
6. **Backend:** `StoreUserRequest` valida datos
7. **Backend:** Crea usuario y asigna rol con Spatie Permissions
8. **Backend:** Retorna usuario creado con rol
9. **Frontend:** Transforma respuesta usando `transformLaravelUser()`
   - "Super Admin" → "admin"
   - "Moderador" → "moderador"
10. **Frontend:** Muestra mensaje de éxito y actualiza lista

### Listar Usuarios

1. **Frontend:** Llama `usersService.getAdmins()`
2. **Frontend:** GET a `/api/v1/users` con Bearer token
3. **Backend:** Middleware verifica que usuario sea "Super Admin"
4. **Backend:** Query filtra solo usuarios con rol "Super Admin" o "Moderador"
5. **Backend:** Retorna lista de usuarios con sus roles
6. **Frontend:** Transforma cada usuario con `transformLaravelUser()`
7. **Frontend:** Muestra lista en tabla

## Seguridad

### Backend (Laravel)
✅ Todas las rutas protegidas con middleware `auth:sanctum` y `role:Super Admin`
✅ Validaciones de negocio en Request classes
✅ No puede eliminar último Super Admin
✅ No puede eliminarse a sí mismo
✅ No puede cambiar su propio rol
✅ Transacciones DB para operaciones atómicas
✅ Logs de auditoría en operaciones críticas

### Frontend (React)
✅ Bearer token enviado automáticamente en headers
✅ Validación de formularios con Zod
✅ Transformación de roles bidireccional
✅ Manejo de errores 403, 404, 422
✅ No expone datos sensibles en localStorage

## Manejo de Errores

### Error 403 (Forbidden)
```typescript
if (error.response?.status === 403) {
  throw new Error(error.response.data.message || 'No tienes permisos');
}
```

### Error 404 (Not Found)
```typescript
if (error.response?.status === 404) {
  throw new Error('Usuario no encontrado');
}
```

### Error 422 (Validation Error)
```typescript
if (error.response?.status === 422) {
  const errors = error.errors || {};
  const firstError = Object.values(errors)[0]?.[0];
  throw new Error(firstError as string);
}
```

## UI/UX - Modal de Eliminación

### Antes (window.confirm)
```javascript
// ❌ Modal nativo del navegador - poco profesional
if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${adminName}?`)) {
  return;
}
```

**Problemas:**
- Apariencia inconsistente entre navegadores
- No se puede personalizar el estilo
- Bloquea el hilo principal del navegador
- No se integra con el sistema de diseño

### Después (DeleteConfirmDialog)
```typescript
// ✅ Modal profesional con AlertDialog de shadcn/ui
<DeleteConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  itemName={adminToDelete?.name || ''}
  itemType="user"
  onConfirm={confirmDeleteAdmin}
/>
```

**Ventajas:**
- ✅ Diseño consistente con el resto de la aplicación
- ✅ Componente reutilizable para diferentes entidades
- ✅ Animaciones suaves y profesionales
- ✅ Accesible (navegable con teclado, screen readers)
- ✅ Botones estilizados con colores del tema (brand-orange)
- ✅ Mensaje personalizado con nombre del usuario
- ✅ No bloquea la interfaz de usuario

## Control de Permisos por Rol

### Problema: Moderadores podían ver botones que no podían usar

Inicialmente, los usuarios Moderador podían ver todos los botones de gestión de usuarios (Crear, Editar, Eliminar) pero al intentar usarlos recibían errores del backend en inglés.

### Solución Implementada: Doble Capa de Seguridad

#### 1. Frontend: Deshabilitar Botones para Moderadores

**Archivo:** `src/pages/AdminUsers.tsx`
```typescript
// Detectar si el usuario es Super Admin
const { user } = useAuth();
const isSuperAdmin = user?.role === 'admin'; // Solo 'admin', NO 'moderador'

// Pasar flag a componentes
<AdminsList
  admins={filteredAdmins}
  canManageUsers={isSuperAdmin}  // Solo Super Admin puede gestionar
/>
```

**Archivos modificados:**
- `src/features/admin-users/components/AdminsList.tsx` - Botón "Nuevo Admin" deshabilitado
- `src/features/admin-users/components/AdminsTable.tsx` - Botones Editar/Eliminar deshabilitados
- `src/features/admin-users/components/AdminCard.tsx` - Botones Editar/Eliminar deshabilitados

**Características:**
```typescript
// Botones con estados visuales claros
<Button
  disabled={!canManageUsers}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
  title={!canManageUsers ? 'Solo los Super Admin pueden crear usuarios' : ''}
>
  Nuevo Admin
</Button>
```

**UI/UX:**
- ✅ Botones visualmente deshabilitados (opacidad 50%)
- ✅ Cursor "not-allowed" al pasar el mouse
- ✅ Tooltips informativos explicando por qué están deshabilitados
- ✅ Moderadores pueden VER la lista (solo lectura)
- ❌ Moderadores NO pueden crear/editar/eliminar

#### 2. Backend: Mensajes de Error Traducidos

**Archivo:** `src/features/admin-users/hooks/useUsersAdmin.ts`

**Función loadAdmins() - Líneas 42-70:**
```typescript
catch (error: any) {
  const errorMessage = error.response?.data?.message || error.message || '';
  let description = 'No se pudieron cargar los administradores';

  // Detectar error de permisos del backend
  if (errorMessage.includes('does not have the right roles') ||
      errorMessage.includes('right roles') ||
      error.response?.status === 403) {
    description = 'No tienes permisos para gestionar usuarios. Solo los Super Admin pueden crear/editar/eliminar administradores.';
  }

  toast({ title: 'Error al cargar administradores', description, variant: 'destructive' });
}
```

**Función handleSubmitAdmin() - Líneas 174-196:**
```typescript
catch (error: any) {
  const errorMessage = error.response?.data?.message || error.message || '';
  let description = 'Ocurrió un error inesperado';

  // Traducir mensajes del backend
  if (errorMessage.includes('does not have the right roles') ||
      errorMessage.includes('right roles') ||
      error.response?.status === 403) {
    description = 'No tienes permisos para gestionar usuarios. Solo los Super Admin pueden crear/editar/eliminar administradores.';
  }

  toast({ title: editingAdmin ? 'Error al actualizar' : 'Error al crear', description });
}
```

**Antes vs Después:**
```
❌ ANTES: "User does not have the right roles."
✅ AHORA: "No tienes permisos para gestionar usuarios. Solo los Super Admin pueden crear/editar/eliminar administradores."
```

## Testing Completado ✅

- [x] Probar creación de usuario Super Admin desde UI
- [x] Probar creación de usuario Moderador desde UI
- [x] Verificar que transformaciones de roles funcionen correctamente
- [x] Probar actualización de usuarios
- [x] Probar eliminación de usuarios con modal profesional
- [x] Verificar validaciones de seguridad:
  - [x] No permite cambiar el propio rol del usuario logueado
  - [x] Modal de confirmación profesional para eliminar usuarios
  - [x] Mensajes de error traducidos al español
  - [x] Botones deshabilitados para Moderadores
  - [x] Tooltips informativos en botones deshabilitados

## Mejoras Implementadas

### 1. Modal de Eliminación Profesional
- Reemplazado `window.confirm()` por `DeleteConfirmDialog` de shadcn/ui
- UI consistente con el resto de la aplicación
- Componente reutilizable en otros módulos

### 2. Componentes Actualizados
- Todos los componentes usan `AdminProfile` del backend
- Estados de carga implementados (`isLoading`, `isSaving`)
- Manejo de errores con mensajes toast descriptivos en español
- Control de permisos visual (botones deshabilitados)

### 3. Validaciones de Seguridad
- **Backend:** Valida que no se pueda eliminar el último Super Admin
- **Backend:** Valida que no se pueda eliminar el usuario actual
- **Frontend:** Deshabilita botones para usuarios sin permisos
- **Frontend:** Mensajes de error traducidos y descriptivos
- **Frontend:** Tooltips explicativos en botones deshabilitados

## Notas Importantes

1. **Solo Super Admin gestiona usuarios:** Los Moderadores NO pueden crear/editar/eliminar usuarios admin
2. **Clientes no se gestionan aquí:** Los clientes se registran ellos mismos vía `/auth/register`
3. **Mapeo de roles:** Siempre usar transformers para convertir entre Laravel y Frontend
4. **Password opcional al editar:** Solo enviar password si se desea cambiar
5. **Confirmación de password:** Siempre requerida cuando se envía password

## Testing

Para probar la integración:

1. Login como Super Admin
2. Ir a la sección de gestión de usuarios
3. Crear un nuevo usuario Admin
4. Crear un nuevo usuario Moderador
5. Verificar que aparezcan en la lista
6. Editar un usuario existente
7. Intentar eliminar el último Super Admin (debe fallar)
8. Intentar eliminarse a sí mismo (debe fallar)
9. Eliminar un Moderador (debe funcionar)
