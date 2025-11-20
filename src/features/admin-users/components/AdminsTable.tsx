/**
 * AdminsTable Component
 * Desktop table view for admins
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Usa AdminProfile del backend
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import type { AdminProfile } from '@/features/auth';

interface AdminsTableProps {
  admins: AdminProfile[];
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

export const AdminsTable: React.FC<AdminsTableProps> = ({
  admins,
  onEdit,
  onDelete,
  canManageUsers = true,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead>Email Verificado</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{admin.name}</TableCell>
            <TableCell className="text-muted-foreground">{admin.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                {formatRole(admin.role)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(admin.created_at)}</TableCell>
            <TableCell className="text-muted-foreground">
              {admin.email_verified_at ? formatDate(admin.email_verified_at) : 'No verificado'}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(admin)}
                  disabled={!canManageUsers}
                  className="text-brand-orange hover:text-brand-orange hover:bg-brand-orange/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canManageUsers ? 'Solo los Super Admin pueden editar usuarios' : ''}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(admin.id)}
                  disabled={!canManageUsers}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canManageUsers ? 'Solo los Super Admin pueden eliminar usuarios' : ''}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};