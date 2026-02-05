// Inventory Management Service (Admin TypeScript)
// Handles inventory and stock management for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ApiResponse } from '../types/api';

export const inventoryService = {
    /**
     * Get all stocks for an outlet
     * @param outletId - Outlet ID
     * @returns Stock data
     */
    getStocks: async (outletId: number): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.GET_STOCKS}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Add stock
     * @param data - Stock addition data
     * @returns Success response
     */
    addStock: async (data: any): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.ADD_STOCK, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Deduct stock
     * @param data - Stock deduction data
     * @returns Success response
     */
    deductStock: async (data: any): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.DEDUCT_STOCK, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Get stock history
     * @param outletId - Outlet ID
     * @returns Stock transaction history
     */
    getStockHistory: async (outletId: number): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.STOCK_HISTORY, {
            method: 'POST',
            body: { outletId }
        });
    },
};
