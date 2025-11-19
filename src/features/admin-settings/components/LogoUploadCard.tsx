/**
 * LogoUploadCard Component
 * Reusable component for uploading and managing logos
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, RotateCcw, X } from 'lucide-react';
import { OptimizedImage } from '@/components/common';

interface LogoUploadCardProps {
  title: string;
  description: string;
  currentLogo: ReactNode;
  preview: string | null;
  isUploading: boolean;
  onFileChange: (file: File) => void;
  onSave: () => void;
  onRemove: () => void;
  onCancelPreview: () => void;
}

export const LogoUploadCard = ({
  title,
  description,
  currentLogo,
  preview,
  isUploading,
  onFileChange,
  onSave,
  onRemove,
  onCancelPreview,
}: LogoUploadCardProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const hasPreviewChanged = preview !== null;
  const savedLogo = hasPreviewChanged ? preview : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor={`logo-upload-${title}`}>
              Seleccionar archivo
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id={`logo-upload-${title}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleInputChange}
                disabled={isUploading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById(`logo-upload-${title}`)?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Logo actual</Label>
            <div className="mt-2 p-4 border rounded-lg bg-muted/50 flex items-center justify-center min-h-[100px]">
              {currentLogo}
            </div>
          </div>

          {preview && (
            <div>
              <Label>Vista previa</Label>
              <div className="mt-2 p-4 border rounded-lg bg-muted/50 flex items-center justify-center min-h-[100px]">
                <OptimizedImage
                  src={preview}
                  alt="Vista previa del logo"
                  className="max-h-24 object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {preview && (
              <>
                <Button onClick={onSave} disabled={isUploading}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancelPreview}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            {savedLogo && (
              <Button
                variant="destructive"
                onClick={onRemove}
                disabled={isUploading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar logo por defecto
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};