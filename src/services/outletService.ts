// Outlet Management Service (TypeScript)
// Handles all outlet-related API calls for superadmin

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
    Outlet,
    ApiResponse,
} from '../types/api';

export interface OutletCreateRequest {
    name: string;
    address: string;
    phone: string;
    email: string;
}

export const outletService = {
    /**
     * Get all outlets
     * @returns List of outlets
     */
    getOutlets: async (): Promise<ApiResponse<Outlet[]>> => {
        return await apiRequest<ApiResponse<Outlet[]>>(API_ENDPOINTS.GET_OUTLETS, {
            method: 'GET',
        });
    },

    /**
     * Add new outlet
     * @param data - Outlet creation data
     * @returns Created outlet
     */
    addOutlet: async (data: OutletCreateRequest): Promise<ApiResponse<Outlet>> => {
        return await apiRequest<ApiResponse<Outlet>>(API_ENDPOINTS.ADD_OUTLET, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Remove outlet
     * @param outletId - Outlet ID
     * @returns Success confirmation
     */
    removeOutlet: async (outletId: number): Promise<ApiResponse<void>> => {
        return await apiRequest<ApiResponse<void>>(`${API_ENDPOINTS.REMOVE_OUTLET}/${outletId}`, {
            method: 'DELETE',
        });
    },
};
