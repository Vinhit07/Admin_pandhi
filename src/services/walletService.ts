// Wallet Management Service (Admin TypeScript)
// Handles wallet management for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ApiResponse } from '../types/api';

export const walletService = {
    /**
     * Get wallet history for an outlet
     * @param outletId - Outlet ID
     * @returns Wallet transaction history
     */
    getWalletHistory: async (outletId: number | string): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.GET_WALLET_HISTORY}/${outletId}/`, {
            method: 'GET',
        });
    },

    /**
     * Get recharge history for an outlet
     * @param outletId - Outlet ID
     * @returns Recharge history
     */
    getRechargeHistory: async (outletId: number | string): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.GET_RECHARGE_HISTORY}/${outletId}/`, {
            method: 'GET',
        });
    },

    /**
     * Get orders paid via wallet
     * @param outletId - Outlet ID
     * @returns Orders paid with wallet
     */
    getOrdersPaidViaWallet: async (outletId: number | string): Promise<ApiResponse<any>> => {
        // Backend now supports outlet filtering via path param
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.GET_ORDERS_PAID_VIA_WALLET}/${outletId}`, {
            method: 'GET',
        });
    },
};
