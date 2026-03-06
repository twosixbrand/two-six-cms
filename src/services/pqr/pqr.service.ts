import { handleResponse } from '../apiUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

export const PqrService = {
    // Obtener todas las PQRs
    getAllPqrs: async () => {
        try {
            const response = await fetch(`${API_URL}/pqr`);
            return await handleResponse(response, 'PQR_GET_ALL');
        } catch (error) {
            console.error('Error fetching PQRs:', error);
            throw error;
        }
    },

    // Obtener detalles de una PQR específica
    getPqrById: async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/pqr/${id}`);
            return await handleResponse(response, `PQR_GET_${id}`);
        } catch (error) {
            console.error(`Error fetching PQR with id ${id}:`, error);
            throw error;
        }
    },

    // Actualizar el estado de una PQR
    updatePqrStatus: async (id: number, status: string) => {
        try {
            const response = await fetch(`${API_URL}/pqr/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return await handleResponse(response, `PQR_UPDATE_${id}`);
        } catch (error) {
            console.error(`Error updating status for PQR ${id}:`, error);
            throw error;
        }
    }
};
