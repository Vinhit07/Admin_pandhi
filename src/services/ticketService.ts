// Ticket Management Service (Admin TypeScript)
// Handles ticket/support management for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ApiResponse } from '../types/api';

export const ticketService = {
    /**
     * Get all tickets for an outlet
     * @param outletId - Outlet ID
     * @returns List of tickets
     */
    getTickets: async (outletId: number): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.GET_TICKETS}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Close a ticket
     * @param ticketId - Ticket ID
     * @returns Success response
     */
    closeTicket: async (ticketId: number): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.CLOSE_TICKET, {
            method: 'POST',
            body: { ticketId },
        });
    },
};
