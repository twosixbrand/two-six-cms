const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Internal Server Error');
    }
  }
  if (response.status === 204) {
    return;
  }
  return response.json();
};

/**
 * Obtiene todos los permisos agrupados por grupo.
 * GET /permissions
 */
export const getPermissions = async () => {
  const response = await fetch(`${API_BASE_URL}/permissions`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Obtiene los permisos asignados a un rol específico.
 * GET /permissions/role/:roleId
 */
export const getRolePermissions = async (roleId: number | string) => {
  const response = await fetch(`${API_BASE_URL}/permissions/role/${roleId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Asigna permisos a un rol.
 * POST /permissions/role/:roleId
 */
export const setRolePermissions = async (roleId: number | string, permissionIds: number[]) => {
  const response = await fetch(`${API_BASE_URL}/permissions/role/${roleId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ permissionIds }),
  });
  return handleResponse(response);
};

/**
 * Obtiene los permisos de un usuario específico.
 * GET /permissions/user/:userId
 */
export const getUserPermissions = async (userId: number | string) => {
  const response = await fetch(`${API_BASE_URL}/permissions/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
