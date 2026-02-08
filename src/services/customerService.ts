// Customer Management Service (TypeScript)
// Handles customer-related API calls

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Customer, ApiResponse } from '../types/api';

export const customerService = {
    /**
     * Get all customers for an outlet
     * @param outletId - Outlet ID
     * @returns List of customers
     */
    getCustomers: async (outletId: number | string): Promise<ApiResponse<Customer[]>> => {
        return await apiRequest<ApiResponse<Customer[]>>(`${API_ENDPOINTS.GET_CUSTOMERS}/${outletId}/`, {
            method: 'GET',
        });
    },
};
