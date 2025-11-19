/**
 * Product Image Upload Component
 * Handles image upload and preview for products
 */

import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProductImageUploadProps {
  selectedImage: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  id?: string;
}

export const ProductImageUpload = ({
  selectedImage,
  onImageUpload,
  onRemoveImage,
  id = 'image-upload'
}: ProductImageUploadProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Imagen del Producto *</Label>
      <p className="text-xs text-muted-foreground">
        Dimensiones recomendadas: 1000x1000px (formato cuadrado)
      </p>
      {!selectedImage ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra una imagen o haz clic para seleccionar
          </p>
          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          <label htmlFor={id}>
            <Button variant="outline" size="sm" type="button" asChild>
              <span>Seleccionar imagen</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="relative bg-muted rounded-lg">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full h-64 object-contain rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemoveImage}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
