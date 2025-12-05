import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3050/api';

const locationApi = {
    getDepartments: async () => {
        const response = await axios.get(`${API_URL}/locations/departments`);
        return response.data;
    },

    getCities: async (departmentId, activeOnly = false) => {
        const response = await axios.get(`${API_URL}/locations/cities/${departmentId}`, {
            params: { active: activeOnly }
        });
        return response.data;
    },

    updateDepartment: async (id, data) => {
        const response = await axios.patch(`${API_URL}/locations/departments/${id}`, data);
        return response.data;
    },

    updateCity: async (id, data) => {
        const response = await axios.patch(`${API_URL}/locations/cities/${id}`, data);
        return response.data;
    },
};

export default locationApi;
