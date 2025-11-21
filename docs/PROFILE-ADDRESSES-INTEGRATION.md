# Integración de Perfil y Direcciones

**Fecha:** 2025-11-20
**Estado:** ✅ Completado

## Descripción

Integración completa del sistema de gestión de perfiles y direcciones entre el frontend (React/TypeScript) y el backend (Laravel). Se centralizó la lógica de perfiles en el módulo `admin-profile` haciéndolo reutilizable para todos los tipos de usuarios (Admin, Moderador, Cliente).

---

## 🎯 FASE 1: Centralización de Admin-Profile

### Objetivo
Crear una arquitectura centralizada y reutilizable para la gestión de perfiles que elimine código duplicado entre `admin-profile` y `auth`.

### Archivos Creados/Modificados

#### 1. **Servicio Centralizado de Perfil**
**Archivo:** [src/features/admin-profile/services/profile.service.ts](../src/features/admin-profile/services/profile.service.ts)

**Características:**
- ✅ Integrado con Laravel: `GET /api/v1/profile`, `PUT /api/v1/profile`
- ✅ Transformación bidireccional de roles (Laravel ↔ Frontend)
- ✅ Manejo de avatares (pendiente backend)
- ✅ Validación de errores 401, 422
- ✅ Limpieza automática de passwords vacíos

**Funciones:**
```typescript
// Obtener perfil del usuario autenticado
profileService.getProfile(): Promise<ApiResponse<UserProfile>>

// Actualizar perfil
profileService.updateProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}): Promise<ApiResponse<UserProfile>>

// Subir avatar (pendiente backend)
profileService.uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>>
```

**Mapeo de Roles:**
```typescript
// Laravel → Frontend
"Super Admin" → "admin"
"Moderador" → "moderador"
"Cliente" → "cliente"
```

---

#### 2. **Hook Unificado useProfileEditor**
**Archivo:** [src/features/admin-profile/hooks/useProfileEditor.ts](../src/features/admin-profile/hooks/useProfileEditor.ts)

**Características:**
- ✅ Reutilizable para Admin, Moderador y Cliente
- ✅ Soporte condicional para campo `phone` (solo clientes)
- ✅ Soporte condicional para avatar
- ✅ Validación con Zod
- ✅ Callback `onSuccess` para actualizar contextos

**Uso:**
```typescript
const profileEditor = useProfileEditor(user, {
  includePhone: true,  // Para clientes
  includeAvatar: true,
  onSuccess: (updatedUser) => {
    // Actualizar AuthContext, etc.
  }
});
```

**Retorno:**
```typescript
{
  isEditing: boolean;
  avatarFile: File | null;
  avatarPreview: string | null;
  formData: ProfileFormData;
  isUploading: boolean;
  errors: Record<string, string>;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFieldChange: (field: string, value: string) => void;
}
```

---

#### 3. **Validaciones Unificadas**
**Archivo:** [src/features/admin-profile/validations/profile.validation.ts](../src/features/admin-profile/validations/profile.validation.ts)

**Schemas:**
```typescript
// Para Admin/Moderador (sin phone)
profileSchema: z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).optional(),
  password_confirmation: z.string().optional(),
})

// Para Cliente (con phone)
profileSchemaWithPhone: z.object({
  ...profileSchema,
  phone: z.string().regex(/^\d{8,15}$/).optional(),
})
```

**Validación de contraseñas:**
- Solo se valida si `password` tiene contenido
- Debe coincidir con `password_confirmation`
- Mínimo 8 caracteres

---

#### 4. **Actualización de useAdminProfile**
**Archivo:** [src/features/admin-profile/hooks/useAdminProfile.ts](../src/features/admin-profile/hooks/useAdminProfile.ts)

**Cambios:**
- ❌ **ELIMINADO:** Funciones temporales `uploadAvatarTemp` y `updateAdminProfileTemp`
- ✅ **AGREGADO:** Integración con `profileService`
- ⚠️ **DEPRECATED:** Se recomienda usar `useProfileEditor` para nuevas implementaciones

---

#### 5. **Actualización de useAccountPage**
**Archivo:** [src/features/auth/hooks/useAccountPage.ts](../src/features/auth/hooks/useAccountPage.ts)

**Cambios:**
- ❌ **ELIMINADO:** Función temporal `updateProfile`
- ✅ **AGREGADO:** Uso de `profileService` directamente
- ✅ **AGREGADO:** Integración con `useProfileEditor`
- ✅ **AGREGADO:** Actualización de `AuthContext` después del guardado

---

#### 6. **Actualización de AuthContext**
**Archivo:** [src/features/auth/contexts/AuthContext.tsx](../src/features/auth/contexts/AuthContext.tsx)

**Nuevo método:**
```typescript
updateUser(user: UserProfile): void
```

**Funcionalidad:**
- Actualiza el usuario en el estado
- Sincroniza con `localStorage`
- Usado después de actualizaciones de perfil

---

### Beneficios de la Fase 1

| **Antes** | **Después** |
|-----------|-------------|
| Código duplicado en `useAdminProfile` y `useAccountPage` | Hook unificado `useProfileEditor` |
| Validaciones duplicadas | Un solo schema con variantes |
| Funciones mock temporales | Servicio integrado con backend |
| Sin sincronización con AuthContext | Actualización automática via `updateUser` |

---

## 🎯 FASE 2: Integración de Addresses

### Objetivo
Eliminar todos los datos mock y conectar completamente el módulo de direcciones con el backend Laravel.

### Backend Endpoints

#### **Cliente Endpoints**
```
GET    /api/v1/addresses                    - Listar direcciones del usuario
POST   /api/v1/addresses                    - Crear dirección
GET    /api/v1/addresses/{id}               - Ver dirección específica
PUT    /api/v1/addresses/{id}               - Actualizar dirección
DELETE /api/v1/addresses/{id}               - Eliminar dirección
POST   /api/v1/addresses/{id}/set-default   - Marcar como predeterminada
```

**Middleware:** `auth:sanctum`, `role:Cliente`

#### **Admin Endpoints (Solo Lectura)**
```
GET /api/v1/admin/addresses              - Listar todas las direcciones
GET /api/v1/admin/addresses/{id}         - Ver dirección específica
GET /api/v1/admin/users/{userId}/addresses - Ver direcciones de un usuario
```

**Middleware:** `auth:sanctum`, `role:Super Admin`

---

### Archivos Actualizados

#### 1. **Servicio de Direcciones**
**Archivo:** [src/features/addresses/services/addresses.service.ts](../src/features/addresses/services/addresses.service.ts)

**Cambios:**
- ❌ **ELIMINADO:** TODO el código mock con `localStorage`
- ✅ **AGREGADO:** Integración completa con API Laravel
- ✅ **AGREGADO:** Transformadores bidireccionales
- ✅ **AGREGADO:** Manejo de errores 401, 403, 404, 422

**Transformaciones:**
```typescript
// Backend usa "address_details", frontend usa "address"
const transformLaravelAddress = (laravelAddress) => ({
  ...laravelAddress,
  id: laravelAddress.id.toString(),
  user_id: laravelAddress.user_id.toString(),
  address: laravelAddress.address_details, // ⚠️ Mapping clave
})

const transformToLaravelAddress = (address) => ({
  ...address,
  address_details: address.address, // ⚠️ Mapping clave
})
```

**Funciones:**
```typescript
// Listar direcciones del cliente autenticado
addressesService.getMyAddresses(): Promise<ApiResponse<Address[]>>

// Crear dirección
addressesService.create(data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>)

// Actualizar dirección
addressesService.update(id: string, data: Partial<Address>)

// Eliminar dirección
addressesService.delete(id: string)

// Marcar como predeterminada
addressesService.setAsDefault(id: string)

// [ADMIN] Ver direcciones de un usuario
addressesService.getUserAddresses(userId: string)
```

---

#### 2. **Validaciones de Direcciones**
**Archivo:** [src/features/addresses/validations/address.validation.ts](../src/features/addresses/validations/address.validation.ts)

**Cambios:**
- ✅ Validaciones alineadas con backend `StoreAddressRequest`
- ✅ Límites de caracteres coinciden con Laravel
- ✅ Validación de etiquetas: `'Casa' | 'Trabajo' | 'Otro'`

**Schema de Creación:**
```typescript
addressSchema: z.object({
  label: z.string()
    .min(1, 'La etiqueta es requerida')
    .max(50)
    .refine(val => ['Casa', 'Trabajo', 'Otro'].includes(val)),

  province: z.string().min(1).max(100),
  canton: z.string().min(1).max(100),
  district: z.string().min(1).max(100),

  address: z.string()
    .min(10, 'Las señas exactas deben tener al menos 10 caracteres')
    .max(500),

  is_default: z.boolean().optional(),
})
```

**Schema de Actualización:**
```typescript
updateAddressSchema: z.object({
  // Todos los campos opcionales
  label: z.string().max(50).refine(...).optional(),
  province: z.string().max(100).optional(),
  canton: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  address: z.string().min(10).max(500).optional(),
  is_default: z.boolean().optional(),
})
```

---

### Lógica del Backend

#### **Dirección Predeterminada Automática**
El backend Laravel maneja automáticamente:
1. La **primera dirección** de un usuario se marca como predeterminada
2. Al marcar una dirección como predeterminada, desmarca las demás
3. Al eliminar la dirección predeterminada, asigna la primera disponible

**No es necesario manejar esto en el frontend** ✅

#### **Validación de Ubicación CR**
El backend valida que la combinación `province + canton + district` exista en la tabla `cr_locations`.

**Respuesta de error 422:**
```json
{
  "message": "La combinación de Provincia, Cantón y Distrito no es válida en Costa Rica",
  "errors": {
    "district": ["La combinación de Provincia, Cantón y Distrito no es válida..."]
  }
}
```

---

## 🔄 Flujo de Datos

### Actualizar Perfil (Cliente)

```
┌─────────────┐
│   Cliente   │
│  (Account)  │
└──────┬──────┘
       │ 1. Edita perfil
       ▼
┌─────────────────────┐
│ useAccountPage      │
│   → profileService  │
└──────┬──────────────┘
       │ 2. PUT /api/v1/profile
       ▼
┌─────────────────────┐
│  Laravel Backend    │
│  ProfileController  │
│  UpdateProfileRequest│
└──────┬──────────────┘
       │ 3. Valida y actualiza
       ▼
┌─────────────────────┐
│  Response {user}    │
└──────┬──────────────┘
       │ 4. Transform
       ▼
┌─────────────────────┐
│  AuthContext        │
│  updateUser(user)   │
└─────────────────────┘
```

### Crear Dirección (Cliente)

```
┌─────────────┐
│   Cliente   │
│  AddressList│
└──────┬──────┘
       │ 1. Crea dirección
       ▼
┌─────────────────────┐
│ addressesService    │
│   .create(data)     │
└──────┬──────────────┘
       │ 2. Transform: address → address_details
       │ 3. POST /api/v1/addresses
       ▼
┌─────────────────────┐
│  Laravel Backend    │
│  AddressController  │
│  StoreAddressRequest│
└──────┬──────────────┘
       │ 4. Valida ubicación CR
       │ 5. Marca 1ra como default
       │ 6. Crea dirección
       ▼
┌─────────────────────┐
│  Response {address} │
└──────┬──────────────┘
       │ 7. Transform: address_details → address
       ▼
┌─────────────────────┐
│  Frontend actualiza │
│  lista de direcciones│
└─────────────────────┘
```

---

## 📝 Mapeo de Campos Importantes

### **Perfiles**

| **Backend (Laravel)** | **Frontend (React)** | **Tipo** |
|-----------------------|----------------------|----------|
| `name` | `name` | string |
| `email` | `email` | string |
| `phone` | `phone` | string \| undefined |
| `password` | `password` | string (solo enviar si cambia) |
| `password_confirmation` | `password_confirmation` | string |
| `role` (Super Admin) | `role` (admin) | string |
| `role` (Moderador) | `role` (moderador) | string |
| `role` (Cliente) | `role` (cliente) | string |

### **Direcciones**

| **Backend (Laravel)** | **Frontend (React)** | **Notas** |
|-----------------------|----------------------|-----------|
| `id` (int) | `id` (string) | Convertido a string |
| `user_id` (int) | `user_id` (string) | Convertido a string |
| `label` | `label` | 'Casa', 'Trabajo', 'Otro' |
| `province` | `province` | string |
| `canton` | `canton` | string |
| `district` | `district` | string |
| `address_details` | `address` | ⚠️ **CLAVE** |
| `is_default` | `is_default` | boolean |

---

## 🔒 Seguridad

### Backend (Laravel)

✅ **Rutas de perfil protegidas** con `auth:sanctum`
✅ **Rutas de direcciones** protegidas con `auth:sanctum` + `role:Cliente`
✅ **Rutas admin** protegidas con `auth:sanctum` + `role:Super Admin`
✅ **Validación de ubicaciones** con tabla `cr_locations`
✅ **Scope de direcciones** solo del usuario autenticado (`forUser()`)
✅ **Validación de FormRequests** (422)

### Frontend (React)

✅ **Bearer token automático** via axios interceptor
✅ **Validación con Zod** antes de enviar datos
✅ **Transformación de datos** bidireccional
✅ **Manejo de errores** 401, 403, 404, 422
✅ **Actualización de AuthContext** después de cambios

---

## ⚠️ Notas Importantes

### 1. **Campo `address` vs `address_details`**
El backend usa `address_details`, pero el frontend usa `address`. Los transformadores se encargan del mapeo:
```typescript
// Al enviar al backend
address_details: frontendData.address

// Al recibir del backend
address: backendData.address_details
```

### 2. **Avatares Pendientes**
La funcionalidad de avatares está implementada en el frontend pero **pendiente en el backend**. Por ahora, `uploadAvatar()` crea un preview local.

### 3. **Phone Field**
- **Admin/Moderador:** No tienen campo `phone`
- **Cliente:** Tienen campo `phone` opcional
- Usar `profileSchemaWithPhone` para clientes

### 4. **Dirección Predeterminada**
No es necesario manejar la lógica de "desmarcar otras direcciones" en el frontend. El backend lo hace automáticamente.

### 5. **Validación de Ubicación**
El backend valida contra `cr_locations`. Si la combinación no existe, retorna error 422.

---

## 🧪 Testing

### Probar Actualización de Perfil

**Como Admin:**
1. Login como Super Admin
2. Ir a [AdminProfile](../src/pages/AdminProfile.tsx)
3. Editar nombre, email
4. Cambiar password (opcional)
5. Verificar mensaje de éxito

**Como Cliente:**
1. Login como Cliente
2. Ir a [Account](../src/pages/Account.tsx)
3. Editar nombre, email, phone
4. Cambiar password (opcional)
5. Verificar mensaje de éxito

### Probar Direcciones

**Como Cliente:**
1. Login como Cliente
2. Ir a Account → Sección de Direcciones
3. **Crear dirección:**
   - Completar formulario (Casa/Trabajo/Otro)
   - Seleccionar provincia, cantón, distrito
   - Ingresar señas exactas (min 10 chars)
   - Verificar que la primera se marca como predeterminada
4. **Crear segunda dirección:**
   - Verificar que NO es predeterminada
5. **Marcar como predeterminada:**
   - Cambiar predeterminada
   - Verificar que solo una está marcada
6. **Editar dirección:**
   - Modificar señas
   - Verificar actualización
7. **Eliminar dirección predeterminada:**
   - Verificar que la siguiente se marca automáticamente
8. **Validaciones:**
   - Intentar ubicación inválida
   - Verificar error 422

---

## 📊 Resumen de Cambios

### Archivos Creados
- [src/features/admin-profile/services/profile.service.ts](../src/features/admin-profile/services/profile.service.ts)
- [src/features/admin-profile/services/index.ts](../src/features/admin-profile/services/index.ts)
- [src/features/admin-profile/hooks/useProfileEditor.ts](../src/features/admin-profile/hooks/useProfileEditor.ts)

### Archivos Modificados
- [src/features/admin-profile/validations/profile.validation.ts](../src/features/admin-profile/validations/profile.validation.ts)
- [src/features/admin-profile/hooks/useAdminProfile.ts](../src/features/admin-profile/hooks/useAdminProfile.ts)
- [src/features/auth/hooks/useAccountPage.ts](../src/features/auth/hooks/useAccountPage.ts)
- [src/features/auth/contexts/AuthContext.tsx](../src/features/auth/contexts/AuthContext.tsx)
- [src/features/addresses/services/addresses.service.ts](../src/features/addresses/services/addresses.service.ts)
- [src/features/addresses/validations/address.validation.ts](../src/features/addresses/validations/address.validation.ts)

### Código Eliminado
- ❌ Funciones mock en `useAdminProfile`
- ❌ Funciones mock en `useAccountPage`
- ❌ TODO el código mock de `addressesService` (localStorage)
- ❌ Validaciones duplicadas en auth

### Líneas de Código
- **Eliminadas:** ~200 líneas de código mock
- **Agregadas:** ~450 líneas de código productivo
- **Refactorizadas:** ~300 líneas

---

## ✅ Checklist de Integración

### FASE 1: Admin-Profile
- [x] Crear `profileService` con integración Laravel
- [x] Crear `useProfileEditor` hook unificado
- [x] Unificar validaciones de perfil
- [x] Actualizar `useAdminProfile` para usar `profileService`
- [x] Actualizar `useAccountPage` para usar `profileService`
- [x] Agregar método `updateUser` a `AuthContext`
- [x] Eliminar código duplicado

### FASE 2: Addresses
- [x] Eliminar todos los mocks de `addressesService`
- [x] Integrar con endpoints Laravel
- [x] Crear transformadores bidireccionales
- [x] Actualizar validaciones con límites del backend
- [x] Manejar errores 401, 403, 404, 422
- [x] Probar flujo completo de CRUD

---

## 🚀 Próximos Pasos

1. **Implementar backend de avatares**
   - Endpoint: `POST /api/v1/profile/avatar`
   - Storage en `storage/app/public/avatars`
   - Actualizar `uploadAvatar()` en `profileService`

2. **Agregar tests E2E**
   - Cypress tests para flujo de perfil
   - Cypress tests para flujo de direcciones

3. **Optimizaciones**
   - Implementar caché de ubicaciones CR
   - Debounce en búsqueda de ubicaciones
   - Skeleton loaders

4. **Auditoría**
   - Logs de cambios de perfil
   - Logs de operaciones de direcciones

---

## 📞 Soporte

Para dudas sobre esta integración:
- Revisar este documento
- Consultar código fuente con comentarios
- Verificar documentación de Laravel API

---

**Autor:** Claude Code
**Versión:** 1.0.0
**Última actualización:** 2025-11-20
