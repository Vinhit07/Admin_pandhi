// Expenditure Management Service (Admin TypeScript)
// Handles expenditure/expense management for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ApiResponse } from '../types/api';

export const expenditureService = {
    /**
     * Get expenses for an outlet
     * @param outletId - Outlet ID
     * @returns List of expenses
     */
    getExpenses: async (outletId: number): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.GET_EXPENSES}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Add new expense
     * @param data - Expense data
     * @returns Created expense
     */
    addExpense: async (data: any): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.ADD_EXPENSE, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Get expenses by date
     * @param outletId - Outlet ID
     * @param date - Date to fetch expenses for
     * @returns Expenses for the date
     */
    getExpensesByDate: async (outletId: number, date: string): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.GET_EXPENSES_BY_DATE, {
            method: 'POST',
            body: { outletId, date },
        });
    },
};
