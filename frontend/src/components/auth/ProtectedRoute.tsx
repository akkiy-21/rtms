import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { getDefaultRouteForRole } from '@/utils/auth';


interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  allowPasswordChangeRoute?: boolean;
}


export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  allowPasswordChangeRoute = false,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.password_change_required && !allowPasswordChangeRoute) {
    return <Navigate to="/change-password" replace />;
  }

  if (!user.password_change_required && allowPasswordChangeRoute) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};