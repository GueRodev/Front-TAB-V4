/**
 * LoadingState Component
 * Reusable loading state with spinner
 * Shared across Dashboard and Reports features
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
  variant?: 'card' | 'inline';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando...',
  variant = 'card',
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
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
