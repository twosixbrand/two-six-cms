import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Styles
import "../src/styles/App.css";
import App from './App'

// Global Fetch Interceptor to attach accessToken automatically to all legacy API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Safe extraction of URL string
  const url = typeof resource === 'string' ? resource : (resource && (resource as Request).url ? (resource as Request).url : '');
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

  if (url && url.startsWith(apiBaseUrl)) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config = config || {};
      const headers = new Headers(config.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      config.headers = headers;
      args[1] = config;
    }
  }

  return originalFetch(...args);
};
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
