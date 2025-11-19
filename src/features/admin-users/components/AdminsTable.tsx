/**
 * AdminsTable Component
 * Desktop table view for admins
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

interface Admin {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fechaCreacion: string;
  ultimoAcceso: string;
}

interface AdminsTableProps {
  admins: Admin[];
  onEdit: (admin: Admin) => void;
  onDelete: (id: number) => void;
}

export const AdminsTable: React.FC<AdminsTableProps> = ({
  admins,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead>Último Acceso</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{admin.nombre}</TableCell>
            <TableCell className="text-muted-foreground">{admin.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                {admin.rol}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{admin.fechaCreacion}</TableCell>
            <TableCell className="text-muted-foreground">{admin.ultimoAcceso}</TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(admin)}
                  className="text-brand-orange hover:text-brand-orange hover:bg-brand-orange/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(admin.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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