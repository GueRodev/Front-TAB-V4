/*
 * ProtectedRoute Component
 * Route protection based on authentication and role
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requirePermission,
}) => {
  const { isAuthenticated, isAdmin, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
