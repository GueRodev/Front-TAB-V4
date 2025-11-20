/**
 * Data Transformers for Laravel Integration
 * Converts Laravel response format to frontend types
 * 
 * 📖 Documentación completa: docs/AUTH-LARAVEL-INTEGRATION.md
 */

import type { LaravelAuthResponse } from '../types/auth.types';
import type { UserProfile } from '../types/user.types';
import type { AuthResponse } from '../types/auth.types';

/**
 * Mapea roles de Laravel a roles del frontend
 *
 * Laravel: "Super Admin" | "Moderador" | "Cliente"
 * Frontend: "admin" | "moderador" | "cliente"
 *
 * @param laravelRole - Rol desde Laravel ("Super Admin" | "Moderador" | "Cliente")
 * @returns Rol del frontend ("admin" | "moderador" | "cliente")
 *
 * @example
 * ```typescript
 * mapLaravelRoleToFrontend("Super Admin") // "admin"
 * mapLaravelRoleToFrontend("Moderador")   // "moderador"
 * mapLaravelRoleToFrontend("Cliente")     // "cliente"
 * ```
 */
export function mapLaravelRoleToFrontend(laravelRole: string): 'admin' | 'moderador' | 'cliente' {
  const roleMap: Record<string, 'admin' | 'moderador' | 'cliente'> = {
    'Super Admin': 'admin',
    'Moderador': 'moderador',
    'Cliente': 'cliente',
  };

  return roleMap[laravelRole] || 'cliente';
}

/**
 * Mapea roles del frontend a roles de Laravel
 *
 * Frontend: "admin" | "moderador" | "cliente"
 * Laravel: "Super Admin" | "Moderador" | "Cliente"
 *
 * @param frontendRole - Rol del frontend ("admin" | "moderador" | "cliente")
 * @returns Rol de Laravel ("Super Admin" | "Moderador" | "Cliente")
 *
 * @example
 * ```typescript
 * mapFrontendRoleToLaravel("admin")      // "Super Admin"
 * mapFrontendRoleToLaravel("moderador")  // "Moderador"
 * mapFrontendRoleToLaravel("cliente")    // "Cliente"
 * ```
 */
export function mapFrontendRoleToLaravel(frontendRole: 'admin' | 'moderador' | 'cliente'): string {
  const roleMap: Record<string, string> = {
    'admin': 'Super Admin',
    'moderador': 'Moderador',
    'cliente': 'Cliente',
  };

  return roleMap[frontendRole] || 'Cliente';
}

/**
 * Transforma usuario de Laravel a UserProfile del frontend
 * 
 * Conversiones:
 * - id: number → string
 * - role: "Super Admin" → "admin"
 * - Agrega permissions array (Spatie)
 * - Agrega email_verified_at
 * 
 * @param laravelUser - Usuario desde Laravel API
 * @returns UserProfile del frontend
 * 
 * @example
 * ```typescript
 * const frontendUser = transformLaravelUser({
 *   id: 1,
 *   name: "Admin",
 *   email: "admin@example.com",
 *   role: "Super Admin",
 *   permissions: ["view_products", "create_products"],
 *   email_verified_at: "2024-01-01T00:00:00.000Z",
 *   created_at: "2024-01-01T00:00:00.000Z",
 *   updated_at: "2024-01-01T00:00:00.000Z"
 * });
 * // Result: { id: "1", role: "admin", ... }
 * ```
 */
export function transformLaravelUser(laravelUser: LaravelAuthResponse['data']['user']): UserProfile {
  return {
    id: String(laravelUser.id),
    name: laravelUser.name,
    email: laravelUser.email,
    phone: laravelUser.phone,
    role: mapLaravelRoleToFrontend(laravelUser.role),
    permissions: laravelUser.permissions,
    email_verified_at: laravelUser.email_verified_at,
    created_at: laravelUser.created_at,
    updated_at: laravelUser.updated_at || laravelUser.created_at,
  };
}

/**
 * Transforma respuesta completa de autenticación de Laravel
 * 
 * Laravel structure (anidada):
 * {
 *   success: true,
 *   message: "...",
 *   data: { user: {...}, token: "...", token_type: "Bearer" }
 * }
 * 
 * Frontend structure (plana):
 * {
 *   user: UserProfile,
 *   token: string,
 *   token_type: string,
 *   expires_at: string
 * }
 * 
 * @param laravelResponse - Respuesta de Laravel (/login o /register)
 * @returns AuthResponse del frontend
 * 
 * @example
 * ```typescript
 * const authResponse = transformLaravelAuthResponse({
 *   success: true,
 *   message: "Login exitoso",
 *   data: {
 *     user: { id: 1, name: "Admin", ... },
 *     token: "1|abc123...",
 *     token_type: "Bearer"
 *   }
 * });
 * // Result: { user: { id: "1", ... }, token: "1|abc123...", ... }
 * ```
 */
export function transformLaravelAuthResponse(laravelResponse: LaravelAuthResponse): AuthResponse {
  return {
    user: transformLaravelUser(laravelResponse.data.user),
    token: laravelResponse.data.token,
    token_type: laravelResponse.data.token_type,
    expires_at: new Date(Date.now() + 86400000).toISOString(), // 24h por defecto
  };
}
