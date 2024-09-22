// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const role = localStorage.getItem('role');

  return allowedRoles.includes(role!) ? element : <Navigate to="/mylogin" />;
};

export default ProtectedRoute;
