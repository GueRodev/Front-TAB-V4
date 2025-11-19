# Fix: Error 419 en Login - CSRF Token Mismatch

**Fecha:** 2025-11-19
**Estado:** ✅ Resuelto

## Problema

Al intentar hacer login con credenciales correctas de Super Admin, el frontend mostraba:
- Error: "Credenciales incorrectas"
- Backend respondía con status 419 (CSRF Token Mismatch)
- Las peticiones llegaban al backend pero eran rechazadas

## Causa Raíz

El archivo `bootstrap/app.php` del backend tenía habilitado `$middleware->statefulApi()`, que activa la protección CSRF de Laravel Sanctum para modo SPA con cookies.

Esta aplicación usa **Bearer Token Authentication** (tokens en headers), no cookies, por lo que no necesita CSRF tokens.

## Solución

### Backend (Laravel)

**Archivo:** `Backend-Api-TAB-v3/bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware): void {
    // ❌ ANTES (causaba error 419):
    // $middleware->statefulApi();

    // ✅ DESPUÉS (comentado):
    // Comentado porque estamos usando Bearer Token Authentication
    // Si en el futuro usas SPA mode con cookies, descomenta esta línea
    // $middleware->statefulApi();

    $middleware->alias([
        'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
    ]);
})
```

### Frontend (React/TypeScript)

**Archivo:** `src/features/auth/services/auth.service.ts`

Corregido el manejo de errores para verificar `error.response?.status` en lugar de `error.status`:

```typescript
// ❌ ANTES:
if (error.status === 422) {
    // ...
}

// ✅ DESPUÉS:
if (error.response?.status === 422) {
    // ...
}
```

**Líneas modificadas:**
- Línea 46: Función `login()` - manejo de error 422
- Línea 79: Función `register()` - manejo de error 422

## Archivos Modificados

### Backend
- `Backend-Api-TAB-v3/bootstrap/app.php` (línea 15-20)

### Frontend
- `FrontEnd-TAB-main/src/features/auth/services/auth.service.ts` (líneas 46, 79)

## Pruebas

✅ Login con credenciales de Super Admin - Funciona correctamente
✅ Token Bearer se guarda en localStorage
✅ Usuario se autentica y redirige a home
✅ Respuesta del backend incluye user, token y permisos

## Notas Técnicas

### Bearer Token Authentication vs SPA Mode

- **Bearer Token Mode** (actual): Tokens en headers `Authorization: Bearer <token>`
  - No requiere CSRF protection
  - No usa cookies
  - Ideal para APIs REST

- **SPA Mode**: Tokens en cookies httpOnly
  - Requiere CSRF protection (`statefulApi()`)
  - Usa cookies en lugar de headers
  - Ideal para aplicaciones en el mismo dominio

### Configuración CORS

El backend ya tiene configurado CORS correctamente en `config/cors.php`:
- Permite orígenes: `http://localhost:5173` (Vite)
- Permite todos los métodos HTTP
- Permite todos los headers (incluido `Authorization`)

## Próximos Pasos

- [ ] Limpiar logs de depuración temporales (console.log) del servicio de auth
- [ ] Considerar agregar manejo de errores más específico para otros códigos de estado
