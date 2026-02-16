// Admin Management Service (TypeScript)
// Handles admin verification and management API calls

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
    User,
    ApiResponse
} from '../types/api';

export const adminService = {
    /**
     * Get pending admins
     * @returns List of unverified admins
     */
    getPendingAdmins: async (): Promise<ApiResponse<User[]>> => {
        return await apiRequest<ApiResponse<User[]>>(API_ENDPOINTS.PENDING_ADMINS, {
            method: 'GET',
        });
    },

    /**
     * Verify admin
     * @param adminId - Admin ID
     * @returns Success confirmation
     */
    verifyAdmin: async (adminId: number, outletIds: number[]): Promise<any> => {
        return await apiRequest<any>(`${API_ENDPOINTS.VERIFY_ADMIN}/${adminId}`, {
            method: 'POST',
            body: { outletIds }
        });
    },

    /**
     * Get verified admins
     * @returns List of verified admins
     */
    getVerifiedAdmins: async (): Promise<User[]> => {
        return await apiRequest<User[]>(API_ENDPOINTS.VERIFIED_ADMINS, {
            method: 'GET',
        });
    },

    /**
     * Map outlet to admin
     * @param adminId - Admin ID
     * @param outletId - Outlet ID
     * @returns Success confirmation
     */
    mapOutletToAdmin: async (adminId: number, outletId: number): Promise<any> => {
        return await apiRequest<any>(API_ENDPOINTS.MAP_OUTLETS_TO_ADMIN, {
            method: 'POST',
            body: { adminId, outletIds: [outletId] }
        });
    },

    /**
     * Get admin details including outlets and permissions
     * @param adminId - Admin ID
     * @returns Admin details
     */
    getAdminDetails: async (adminId: number): Promise<any> => {
        return await apiRequest<any>(`${API_ENDPOINTS.GET_ADMIN}/${adminId}`, {
            method: 'GET',
        });
    },

    /**
     * Assign permissions to admin
     * @param adminId - Admin ID
     * @param permissions - Permissions object { [outletId]: [{ type, isGranted }] }
     * @returns Success confirmation
     */
    assignAdminPermissions: async (adminId: number, permissions: Record<number, { type: string; isGranted: boolean }[]>): Promise<any> => {
        return await apiRequest<any>(API_ENDPOINTS.ASSIGN_ADMIN_PERMISSIONS, {
            method: 'POST',
            body: { adminId, permissions }
        });
    },

    /**
     * Delete admin
     * @param adminId - Admin ID
     * @returns Success confirmation
     */
    deleteAdmin: async (adminId: number): Promise<any> => {
        return await apiRequest<any>(`${API_ENDPOINTS.DELETE_ADMIN}/${adminId}`, {
            method: 'DELETE',
        });
    }
};
