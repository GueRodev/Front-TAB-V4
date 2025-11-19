/**
 * Adjust Stock Dialog Component
 * Manual stock adjustment with entrada/salida/ajuste types
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { useProducts } from '../contexts';
import type { Product, AdjustStockDto } from '../types';
import { toast } from 'sonner';
import { z } from 'zod';

const adjustStockSchema = z.object({
  type: z.enum(['entrada', 'salida', 'ajuste'], {
    required_error: 'El tipo de ajuste es requerido',
  }),
  quantity: z.number().positive('La cantidad debe ser mayor a 0').max(10000, 'Cantidad máxima: 10,000'),
  reason: z.string().max(500, 'La razón debe tener máximo 500 caracteres').optional(),
});

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export const AdjustStockDialog = ({ open, onOpenChange, product }: AdjustStockDialogProps) => {
  const { adjustStock, loading } = useProducts();
  const [formData, setFormData] = useState<AdjustStockDto>({
    type: 'entrada',
    quantity: 0,
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    // Validate
    try {
      adjustStockSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    try {
      await adjustStock(product.id, formData);
      
      toast.success(`Stock ajustado exitosamente`, {
        description: `${formData.type === 'entrada' ? 'Entrada' : formData.type === 'salida' ? 'Salida' : 'Ajuste'} de ${formData.quantity} unidades`,
      });
      
      // Reset and close
      setFormData({ type: 'entrada', quantity: 0, reason: '' });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Error al ajustar el stock');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowUp className="h-4 w-4" />;
      case 'salida':
        return <ArrowDown className="h-4 w-4" />;
      case 'ajuste':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'salida':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return '';
    }
  };

  const predictedStock = product
    ? formData.type === 'entrada'
      ? product.stock + (formData.quantity || 0)
      : formData.type === 'salida'
      ? Math.max(0, product.stock - (formData.quantity || 0))
      : formData.quantity || 0
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Modifica el inventario de forma manual registrando entradas, salidas o ajustes.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{product.name}</p>
                {product.brand && (
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                )}
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                Stock: {product.stock}
              </Badge>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimiento *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as 'entrada' | 'salida' | 'ajuste' })
              }
            >
              <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    <span>Entrada (Agregar stock)</span>
                  </div>
                </SelectItem>
                <SelectItem value="salida">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-red-600" />
                    <span>Salida (Reducir stock)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ajuste">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span>Ajuste (Establecer cantidad exacta)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {formData.type === 'ajuste' ? 'Cantidad Nueva *' : 'Cantidad *'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              max="10000"
              value={formData.quantity || ''}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
              }
              className={errors.quantity ? 'border-destructive' : ''}
            />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
            
            {/* Stock prediction */}
            {formData.quantity > 0 && product && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className={getTypeColor(formData.type)}>
                  {getTypeIcon(formData.type)}
                  <span className="ml-1">
                    {formData.type === 'entrada' && `+${formData.quantity}`}
                    {formData.type === 'salida' && `-${formData.quantity}`}
                    {formData.type === 'ajuste' && `=${formData.quantity}`}
                  </span>
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">Nuevo stock: {predictedStock}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón (Opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ej: Compra de mercancía, Producto dañado, Corrección de inventario..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              maxLength={500}
              rows={3}
              className={errors.reason ? 'border-destructive' : ''}
            />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
            <p className="text-xs text-muted-foreground">
              {formData.reason?.length || 0}/500 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || formData.quantity <= 0}>
              {loading ? 'Guardando...' : 'Ajustar Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
