const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getGeneralSalesReport = async (startDate, endDate) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/reports/sales/general?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error fetching general sales report');
    }

    return response.json();
};
