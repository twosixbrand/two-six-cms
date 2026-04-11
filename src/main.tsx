import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
// Styles
import "../src/styles/App.css";
import App from './App'

// Configuración Global de Axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config.url || '';
      if (!url.includes('/auth/')) {
        console.warn('[Axios Interceptor] 401 detectado. Redirigiendo...');
        localStorage.removeItem('accessToken');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Global Fetch Interceptor to attach accessToken automatically to all legacy API calls
// Also handles 401 responses by clearing stale tokens and redirecting to login.
let isRedirectingToLogin = false;
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Safe extraction of URL string
  let url = '';
  if (typeof resource === 'string') {
    url = resource;
  } else if (resource && typeof resource === 'object' && 'url' in resource) {
    url = (resource as any).url;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';
  
  // Robust check for API calls (absolute or relative)
  const isApiCall = !!url && (url.startsWith(apiBaseUrl) || url.startsWith('/api/'));
  // Don't attach token to auth endpoints (login, verify-otp, register)
  const isAuthEndpoint = isApiCall && url.includes('/auth/');

  if (isApiCall && !isAuthEndpoint) {
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'null') {
      config = config || {};
      const headers = new Headers(config.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      config.headers = headers;
      args[1] = config;
    }
  }

  const response = await originalFetch(...args);

  // If the backend returns 401 on a non-auth API call, the token is expired/invalid.
  // Clear it and redirect to login to force re-authentication.
  if (isApiCall && !isAuthEndpoint && response.status === 401) {
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;
      console.warn('[Auth Interceptor] Token expirado o inválido (401). Limpiando sesión y redirigiendo...');
      localStorage.removeItem('accessToken');
      // Usamos replace para evitar que el usuario pueda volver atrás al loop 401
      window.location.replace('/login');
    }
  }

  return response;
};
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
