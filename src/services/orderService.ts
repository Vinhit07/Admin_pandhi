// Order Management Service (Admin TypeScript)
// Handles order management for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ApiResponse } from '../types/api';

export const orderService = {
    /**
     * Get all orders for an outlet
     * @param outletId - Outlet ID
     * @returns List of orders
     */
    getOrders: async (outletId: number): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.GET_ORDERS.replace(':outletId', outletId.toString()), {
            method: 'GET',
        });
    },
};
