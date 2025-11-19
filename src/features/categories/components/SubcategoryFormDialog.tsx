/**
 * SubcategoryFormDialog Component
 * Dialog for adding and editing subcategories
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category } from '../types';

interface SubcategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  formData: { name: string };
  onFormDataChange: (data: { name: string }) => void;
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export const SubcategoryFormDialog: React.FC<SubcategoryFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onSubmit,
  loading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {mode === 'add' ? 'Agregar Subcategoría' : 'Editar Subcategoría'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'add'
              ? 'Completa los datos de la nueva subcategoría'
              : 'Modifica los datos de la subcategoría'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parent-category">Categoría Padre</Label>
            <Select value={selectedCategoryId} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-name">Nombre *</Label>
            <Input
              id="subcategory-name"
              placeholder="Ej: Star Wars"
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
              disabled={!formData.name.trim() || !selectedCategoryId || loading}
            >
              {loading ? 'Guardando...' : mode === 'add' ? 'Guardar' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
