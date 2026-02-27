const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Registra un error en el backend.
 * @param {Error} error El objeto del error.
 * @param {string} [pageInfo=window.location.pathname] La ruta de la página donde ocurrió el error.
 */
export const logError = async (error, pageInfo) => {
  try {
    // Llamamos al endpoint de ErrorLog
    await fetch(`${API_BASE_URL}/error-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app: 'cms',
        page: pageInfo || window.location.pathname,
        message: error.message,
        stack: error.stack,
      }),
    });
  } catch (loggingError) {
    console.error('Fallo al registrar el error en el backend:', loggingError);
  }
};