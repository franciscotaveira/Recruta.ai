import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  /** If set, only this role can access the route. */
  requiredRole?: UserRole;
  /** Where to redirect if not authenticated (default: /login). */
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Wrong role — send to their own dashboard
    return <Navigate to={userRole === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
