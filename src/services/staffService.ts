// Staff Management Service (TypeScript)
// Handles all staff-related API calls for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
    Staff,
    StaffCreateRequest,
    StaffUpdateRequest,
    PermissionUpdateRequest,
    ApiResponse,
} from '../types/api';

export const staffService = {
    /**
     * Get all staff members for an outlet
     * @param outletId - Outlet ID
     * @returns List of staff members
     */
    getStaffs: async (outletId: number): Promise<ApiResponse<Staff[]>> => {
        return await apiRequest<ApiResponse<Staff[]>>(`${API_ENDPOINTS.GET_STAFFS}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Get specific staff member by ID
     * @param staffId - Staff ID
     * @returns Staff member details
     */
    getStaffById: async (staffId: number): Promise<ApiResponse<Staff>> => {
        return await apiRequest<ApiResponse<Staff>>(`${API_ENDPOINTS.GET_STAFF}/${staffId}`, {
            method: 'GET',
        });
    },

    /**
     * Add new staff member
     * @param data - Staff creation data
     * @returns Created staff member
     */
    addStaff: async (data: StaffCreateRequest): Promise<ApiResponse<Staff>> => {
        return await apiRequest<ApiResponse<Staff>>(API_ENDPOINTS.ADD_STAFF, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Update staff member
     * @param staffId - Staff ID
     * @param data - Updated staff data
     * @returns Updated staff member
     */
    updateStaff: async (staffId: number, data: StaffUpdateRequest): Promise<ApiResponse<Staff>> => {
        return await apiRequest<ApiResponse<Staff>>(`${API_ENDPOINTS.UPDATE_STAFF}/${staffId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Delete staff member
     * @param staffId - Staff ID
     * @returns Success confirmation
     */
    deleteStaff: async (staffId: number): Promise<ApiResponse<void>> => {
        return await apiRequest<ApiResponse<void>>(`${API_ENDPOINTS.DELETE_STAFF}/${staffId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Update staff permissions
     * @param data - Permission update data
     * @returns Success confirmation
     */
    updatePermissions: async (data: PermissionUpdateRequest): Promise<ApiResponse<void>> => {
        return await apiRequest<ApiResponse<void>>(API_ENDPOINTS.UPDATE_PERMISSIONS, {
            method: 'POST',
            body: data,
        });
    },
};
