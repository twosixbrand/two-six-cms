import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Usado solo para extraer info del usuario (email) en el frontend.
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

  const userEmail = useMemo(() => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.email || null;
  }, [token]);

  const authContextValue = {
    isAuthenticated: !!token,
    token,
    userEmail,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};