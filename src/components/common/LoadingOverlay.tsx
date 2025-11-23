/**
 * LoadingOverlay Component
 * Full-screen loading overlay for async operations
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Procesando...',
  submessage,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-orange/20 rounded-full animate-ping" />
          <div className="relative bg-brand-orange rounded-full p-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-brand-darkBlue">
            {message}
          </h3>
          {submessage && (
            <p className="text-sm text-muted-foreground">
              {submessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
