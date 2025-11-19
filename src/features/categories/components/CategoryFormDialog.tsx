/**
 * CategoryFormDialog Component
 * Dialog for adding and editing categories
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  formData: { name: string };
  onFormDataChange: (data: { name: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {mode === 'add' ? 'Agregar Categoría' : 'Editar Categoría'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'add'
              ? 'Completa los datos de la nueva categoría'
              : 'Modifica los datos de la categoría'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre *</Label>
            <Input
              id="category-name"
              placeholder="Ej: Sets de Construcción"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              maxLength={50}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange/90"
              disabled={!formData.name.trim() || loading}
            >
              {loading ? 'Guardando...' : mode === 'add' ? 'Guardar' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
