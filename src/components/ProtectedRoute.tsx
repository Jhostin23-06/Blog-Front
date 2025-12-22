// En src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../modules/blog/application/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperadmin?: boolean;
}

export function PrivateRoute({ 
  children, 
  requireAdmin = false,
  requireSuperadmin = false 
}: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperadmin && !user?.isSuperadmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && !(user?.isAdmin || user?.isSuperadmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}