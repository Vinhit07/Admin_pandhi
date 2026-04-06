// Authentication Service (TypeScript)
// Handles all authentication-related API calls for admin/superadmin

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { AuthResponse } from '../types/api';

interface SignInCredentials {
    email: string;
    password: string;
}

export const authService = {
    /**
     * Admin signin
     * @param credentials - Email and password
     * @returns Response with user, token, and outlets
     */
    adminSignIn: async (credentials: SignInCredentials): Promise<AuthResponse> => {
        const response = await apiRequest<AuthResponse>(API_ENDPOINTS.ADMIN_SIGN_IN, {
            method: 'POST',
            body: credentials,
        });

        // Store token in localStorage
        if (response && response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    },

    /**
     * SuperAdmin signin
     * @param credentials - Email and password
     * @returns Response with user and token
     */
    superAdminSignIn: async (credentials: SignInCredentials): Promise<AuthResponse> => {
        const response = await apiRequest<AuthResponse>(API_ENDPOINTS.SUPERADMIN_SIGN_IN, {
            method: 'POST',
            body: credentials,
        });

        // Store token in localStorage
        if (response && response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    },

    /**
     * Sign out current user
     * @returns Response confirming signout
     */
    signOut: async (): Promise<void> => {
        await apiRequest(API_ENDPOINTS.SIGN_OUT, {
            method: 'POST',
        });

        // Clear token and data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('outletDetails');
    },

    /**
     * Check current authentication status
     * @returns Response with current user data
     */
    checkAuth: async (): Promise<AuthResponse> => {
        return await apiRequest<AuthResponse>(API_ENDPOINTS.CHECK_AUTH, {
            method: 'GET',
        });
    },
};
