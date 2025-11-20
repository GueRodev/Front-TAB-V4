/**
 * AdminCard Component
 * Mobile/tablet card view for a single admin
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Usa AdminProfile del backend
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2 } from 'lucide-react';
import type { AdminProfile } from '@/features/auth';

interface AdminCardProps {
  admin: AdminProfile;
  onEdit: (admin: AdminProfile) => void;
  onDelete: (id: string) => void;
  canManageUsers?: boolean;
}

const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Super Admin',
    'moderador': 'Moderador',
  };
  return roleMap[role] || role;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  onEdit,
  onDelete,
  canManageUsers = true,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{admin.name}</h4>
          <p className="text-sm text-muted-foreground break-all">{admin.email}</p>
        </div>
        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-200">
          {formatRole(admin.role)}
        </Badge>
      </div>

      <Separator className="my-3" />

      <div className="space-y-2 text-sm mb-3">
        <div>
          <span className="text-muted-foreground">Creación:</span>
          <span className="ml-1">{formatDate(admin.created_at)}</span>
        </div>
        {admin.email_verified_at && (
          <div>
            <span className="text-muted-foreground">Email verificado:</span>
            <span className="ml-1">{formatDate(admin.email_verified_at)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(admin)}
          disabled={!canManageUsers}
          className="flex-1 text-brand-orange border-brand-orange hover:bg-brand-orange/10 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!canManageUsers ? 'Solo los Super Admin pueden editar usuarios' : ''}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(admin.id)}
          disabled={!canManageUsers}
          className="flex-1 text-destructive border-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!canManageUsers ? 'Solo los Super Admin pueden eliminar usuarios' : ''}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
};