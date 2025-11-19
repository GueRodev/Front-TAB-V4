/**
 * AdminFormDialog Component
 * Dialog for creating/editing administrators
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminFormData } from '../validations';

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: AdminFormData;
  onFormDataChange: (data: AdminFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminFormDialog: React.FC<AdminFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFormDataChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Nuevo'} Administrador</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica la información del administrador' 
              : 'Completa el formulario para crear un nuevo administrador'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {isEditing && '(dejar en blanco para mantener actual)'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
                required={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => onFormDataChange({ ...formData, role: value as 'admin' | 'moderador' })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderador">Moderador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar cambios' : 'Crear administrador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};