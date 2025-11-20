import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  // Si no está autenticado, redirige a la página de login.
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;