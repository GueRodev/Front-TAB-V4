/**
 * Users Service
 * API service for user management operations (admin)
 */

import type { UserProfile, ClientProfile, AdminProfile } from '@/features/auth';
import type { ApiResponse } from '@/api/types';

export const usersService = {
  /**
   * Get all clients
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.get('/users/clients');
   * 2. Eliminar líneas 20-22 (mock)
   * 3. Laravel debe retornar: { data: ClientProfile[], timestamp: string }
   */
  async getClients(): Promise<ApiResponse<ClientProfile[]>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.get('/users/clients');
    
    // Mock temporal
    return Promise.resolve({
      data: [],
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Get all admins
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.get('/users/admins');
   * 2. Eliminar líneas 37-39 (mock)
   * 3. Laravel debe retornar: { data: AdminProfile[], timestamp: string }
   */
  async getAdmins(): Promise<ApiResponse<AdminProfile[]>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.get('/users/admins');
    
    // Mock temporal
    return Promise.resolve({
      data: [],
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Update user status (active/inactive)
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.patch(`/users/${userId}/status`, { active });
   * 2. Eliminar líneas 54-60 (mock)
   * 3. Laravel debe retornar: { data: UserProfile, message: string, timestamp: string }
   */
  async updateUserStatus(userId: string, active: boolean): Promise<ApiResponse<UserProfile>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.patch(`/users/${userId}/status`, { active });
    
    // Mock temporal
    return Promise.resolve({
      data: {} as UserProfile,
      message: 'Estado actualizado correctamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Create admin user
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.post('/users/admins', data);
   * 2. Eliminar líneas 78-84 (mock)
   * 3. Laravel debe retornar: { data: AdminProfile, message: string, timestamp: string }
   */
  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<AdminProfile>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.post('/users/admins', data);
    
    // Mock temporal
    return Promise.resolve({
      data: {} as AdminProfile,
      message: 'Administrador creado correctamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Update admin user
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.put(`/users/admins/${adminId}`, data);
   * 2. Eliminar líneas 101-107 (mock)
   * 3. Laravel debe retornar: { data: AdminProfile, message: string, timestamp: string }
   */
  async updateAdmin(adminId: string, data: Partial<AdminProfile>): Promise<ApiResponse<AdminProfile>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.put(`/users/admins/${adminId}`, data);
    
    // Mock temporal
    return Promise.resolve({
      data: {} as AdminProfile,
      message: 'Administrador actualizado correctamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Delete admin user
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.delete(`/users/admins/${adminId}`);
   * 2. Eliminar líneas 122-128 (mock)
   * 3. Laravel debe retornar: { message: string, timestamp: string }
   */
  async deleteAdmin(adminId: string): Promise<ApiResponse<void>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.delete(`/users/admins/${adminId}`);
    
    // Mock temporal
    return Promise.resolve({
      data: undefined as void,
      message: 'Administrador eliminado correctamente',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * ⚠️ ENDPOINT CRÍTICO: Asignación de Roles
   * 
   * REQUISITOS DE SEGURIDAD (Backend Laravel):
   * 
   * 1. **Middleware**: Solo 'admin' puede ejecutar este endpoint
   *    Route::middleware(['auth:sanctum', 'admin'])->post('/users/{userId}/assign-role', ...)
   * 
   * 2. **Validación**: Backend valida permisos antes de modificar
   *    if (!auth()->user()->isAdmin()) { abort(403); }
   * 
   * 3. **Tabla correcta**: Actualizar user_roles (NO users.role)
   *    UserRole::updateOrCreate(['user_id' => $userId], ['role' => $request->role]);
   * 
   * 4. **Audit Log**: Registrar quién hizo el cambio, cuándo y qué rol
   *    Log::info("Admin {auth()->id()} changed role of user $userId to $role");
   * 
   * 5. **Rate Limiting**: Máximo 10 cambios/hora por admin
   *    Route::middleware(['throttle:10,60'])->...
   * 
   * 6. **Validación de rol válido**: Verificar que el rol existe
   *    if (!UserRole::isValidRole($request->role)) { abort(422); }
   * 
   * Ejemplo Laravel Controller completo:
   * ```php
   * public function assignRole(Request $request, $userId)
   * {
   *     // Verificar permisos
   *     if (!auth()->user()->isAdmin()) {
   *         abort(403, 'No autorizado');
   *     }
   *     
   *     // Validar rol
   *     $request->validate([
   *         'role' => 'required|in:admin,cliente',
   *     ]);
   *     
   *     // Actualizar en user_roles table
   *     $targetUser = User::findOrFail($userId);
   *     $targetUser->assignRole($request->role);
   *     
   *     // Audit log
   *     Log::info('Role changed', [
   *         'admin_id' => auth()->id(),
   *         'admin_email' => auth()->user()->email,
   *         'target_user_id' => $userId,
   *         'new_role' => $request->role,
   *         'ip' => $request->ip(),
   *         'timestamp' => now(),
   *     ]);
   *     
   *     return response()->json([
   *         'message' => 'Rol asignado correctamente',
   *     ]);
   * }
   * ```
   * 
   * 📖 Ver SECURITY.md para código SQL completo de user_roles table
   * 
   * 🔗 CONEXIÓN LARAVEL:
   * 1. Descomentar: return apiClient.post(`/users/${userId}/roles`, { role });
   * 2. Eliminar líneas 147-153 (mock)
   * 3. Laravel debe retornar: { data: UserProfile, message: string, timestamp: string }
   * 4. IMPORTANTE: Usar tabla user_roles separada (seguridad)
   */
  async assignRole(userId: string, role: 'admin' | 'cliente'): Promise<ApiResponse<UserProfile>> {
    // TODO: Replace with Laravel endpoint
    // return apiClient.post(`/users/${userId}/roles`, { role });
    
    // Mock temporal
    return Promise.resolve({
      data: {} as UserProfile,
      message: 'Rol asignado correctamente',
      timestamp: new Date().toISOString(),
    });
  },
};
