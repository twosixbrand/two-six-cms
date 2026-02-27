import { logError } from './errorApi';

export const handleResponse = async (response, apiName) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}));
      errorMessage = errorData.message || JSON.stringify(errorData);
    } else {
      errorMessage = await response.text().catch(() => errorMessage);
    }

    const error = new Error(errorMessage);
    logError(error, `App: cms | Api: ${apiName}`);
    throw error;
  }
  return response.status === 204 ? null : response.json();
};