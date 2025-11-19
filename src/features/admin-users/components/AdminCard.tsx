/**
 * AdminCard Component
 * Mobile/tablet card view for a single admin
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2 } from 'lucide-react';

interface Admin {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fechaCreacion: string;
  ultimoAcceso: string;
}

interface AdminCardProps {
  admin: Admin;
  onEdit: (admin: Admin) => void;
  onDelete: (id: number) => void;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{admin.nombre}</h4>
          <p className="text-sm text-muted-foreground break-all">{admin.email}</p>
        </div>
        <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-200">
          {admin.rol}
        </Badge>
      </div>
      
      <Separator className="my-3" />
      
      <div className="space-y-2 text-sm mb-3">
        <div>
          <span className="text-muted-foreground">Creación:</span>
          <span className="ml-1">{admin.fechaCreacion}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Último acceso:</span>
          <span className="ml-1">{admin.ultimoAcceso}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(admin)}
          className="flex-1 text-brand-orange border-brand-orange hover:bg-brand-orange/10"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(admin.id)}
          className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
};