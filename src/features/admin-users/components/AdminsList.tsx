/**
 * AdminsList Component
 * Responsive list of admins with search and add functionality
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Usa AdminProfile del backend
 * - Soporta roles "admin" (Super Admin) y "moderador" (Moderador)
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdminsTable } from './AdminsTable';
import { AdminCard } from './AdminCard';
import { Search, Plus, Shield } from 'lucide-react';
import type { AdminProfile } from '@/features/auth';

interface AdminsListProps {
  admins: AdminProfile[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onEdit: (admin: AdminProfile) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  canManageUsers?: boolean; // Solo Super Admin puede gestionar usuarios
}

export const AdminsList: React.FC<AdminsListProps> = ({
  admins,
  searchQuery,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
  canManageUsers = true,
}) => {
  return (
    <section>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-brand-orange" />
          <h1 className="text-2xl sm:text-3xl font-bold">Administradores</h1>
        </div>
        <p className="text-muted-foreground">Gestiona los usuarios administradores del sistema</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {/* Header with Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar administradores..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={onAdd}
              disabled={!canManageUsers}
              className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canManageUsers ? 'Solo los Super Admin pueden crear usuarios' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Admin
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Cargando administradores...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && admins.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No se encontraron administradores' : 'No hay administradores registrados'}
            </div>
          )}

          {/* Desktop Table */}
          {!isLoading && admins.length > 0 && (
            <div className="hidden lg:block overflow-x-auto">
              <AdminsTable
                admins={admins}
                onEdit={onEdit}
                onDelete={onDelete}
                canManageUsers={canManageUsers}
              />
            </div>
          )}

          {/* Mobile/Tablet Card View */}
          {!isLoading && admins.length > 0 && (
            <div className="lg:hidden space-y-4">
              {admins.map((admin) => (
                <AdminCard
                  key={admin.id}
                  admin={admin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  canManageUsers={canManageUsers}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};