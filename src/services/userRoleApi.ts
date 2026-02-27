const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Something went wrong');
  }
  // For DELETE requests, there might not be a body
  if (response.status === 204) {
    return;
  }
  return response.json();
};

export const getUserRoles = async () => {
  const response = await fetch(`${API_BASE_URL}/user-roles`);
  return handleResponse(response);
};

export const createUserRole = async (userRoleData) => {
  const response = await fetch(`${API_BASE_URL}/user-roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userRoleData),
  });
  return handleResponse(response);
};

/**
 * Deletes a user-role assignment.
 */
export const deleteUserRole = async (id) => {
  const response = await fetch(`${API_BASE_URL}/user-roles/${id}`, {
    method: 'DELETE',
  });

  // Handle 204 No Content specifically
  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Failed to delete user role');
  }

  return; // No content to return on successful deletion
};