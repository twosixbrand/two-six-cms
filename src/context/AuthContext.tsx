import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Usado solo para extraer info del usuario (email, roles, permissions) en el frontend.
 */
const decodeJwtPayload = (jwt) => {
  try {
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  useEffect(() => {
    // Si el token cambia, lo actualizamos en localStorage.
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    navigate('/'); // Redirige al dashboard después del login
  };

  const logout = () => {
    setToken(null);
    navigate('/login'); // Redirige a la página de login
  };

  const decodedPayload = useMemo(() => {
    if (!token) return null;
    return decodeJwtPayload(token);
  }, [token]);

  const userEmail = useMemo(() => {
    return decodedPayload?.email || null;
  }, [decodedPayload]);

  const userRoles = useMemo(() => {
    return decodedPayload?.roles || [];
  }, [decodedPayload]);

  const userPermissions = useMemo(() => {
    return decodedPayload?.permissions || [];
  }, [decodedPayload]);

  /**
   * Verifica si el usuario tiene un permiso específico.
   * @param code Código del permiso, ej: 'accounting.puc.view'
   */
  const hasPermission = (code: string): boolean => {
    if (!userPermissions || userPermissions.length === 0) return true;
    return userPermissions.includes(code);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos indicados.
   * @param codes Lista de códigos de permisos
   */
  const hasAnyPermission = (codes: string[]): boolean => {
    if (!userPermissions || userPermissions.length === 0) return true;
    return codes.some((code) => userPermissions.includes(code));
  };

  /**
   * Verifica si el usuario tiene algún permiso que empiece con el prefijo de grupo.
   * @param group Prefijo del grupo, ej: 'accounting'
   */
  const hasGroupPermission = (group: string): boolean => {
    if (!userPermissions || userPermissions.length === 0) return true;
    return userPermissions.some((p: string) => p === group || p.startsWith(group + '.'));
  };

  const authContextValue = {
    isAuthenticated: !!token,
    token,
    userEmail,
    userRoles,
    userPermissions,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasGroupPermission,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de autenticación.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
