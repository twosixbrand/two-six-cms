import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const AccessDenied = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem',
  }}>
    <div style={{
      fontSize: '4rem',
      marginBottom: '1rem',
      color: 'var(--text-secondary, #999)',
    }}>
      403
    </div>
    <h2 style={{
      fontSize: '1.5rem',
      fontWeight: 600,
      color: 'var(--text-primary, #333)',
      marginBottom: '0.75rem',
    }}>
      Acceso Denegado
    </h2>
    <p style={{
      color: 'var(--text-secondary, #666)',
      fontSize: '1rem',
      maxWidth: '400px',
    }}>
      No tienes los permisos necesarios para acceder a esta seccion.
      Contacta al administrador si crees que esto es un error.
    </p>
  </div>
);

const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, hasPermission, userPermissions } = useContext(AuthContext);

  // Si no esta autenticado, redirige a la pagina de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifica un permiso y el usuario tiene permisos (no legacy),
  // verificar que tenga el permiso requerido.
  if (permission && userPermissions && userPermissions.length > 0) {
    if (!hasPermission(permission)) {
      return <AccessDenied />;
    }
  }

  return children;
};

export default ProtectedRoute;
