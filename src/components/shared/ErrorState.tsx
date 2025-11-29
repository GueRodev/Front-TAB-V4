/**
 * ErrorState Component
 * Reusable error state with retry functionality
 * Shared across Dashboard and Reports features
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  variant?: 'card' | 'inline';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Error al cargar los datos',
  onRetry,
  variant = 'card',
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center py-8">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  );

  if (variant === 'inline') {
    return content;
  }

  return (
    <Card>
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  );
};
