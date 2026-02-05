// Report Service (TypeScript)
// Handles analytics and reporting API calls

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
    DashboardOverview,
    RevenueData,
    CategoryBreakdown,
    TopSellingItem,
    AnalyticsParams,
    ApiResponse,
} from '../types/api';

export const reportService = {
    /**
     * Get dashboard overview statistics
     * @param params - Optional date range parameters
     * @returns Dashboard overview data
     */
    getDashboardOverview: async (params?: any): Promise<ApiResponse<DashboardOverview>> => {
        return await apiRequest<ApiResponse<DashboardOverview>>(API_ENDPOINTS.DASHBOARD_OVERVIEW, {
            method: 'POST',
            body: params || {},
        });
    },

    /**
     * Get revenue trend data
     * @param params - Analytics parameters
     * @returns Revenue trend data
     */
    getRevenueTrend: async (params: AnalyticsParams): Promise<ApiResponse<RevenueData[]>> => {
        return await apiRequest<ApiResponse<RevenueData[]>>(API_ENDPOINTS.REVENUE_TREND, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get order status distribution
     * @param params - Analytics parameters
     * @returns Order status distribution data
     */
    getOrderStatusDistribution: async (params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.ORDER_STATUS_DISTRIBUTION, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get order source distribution
     * @param params - Analytics parameters
     * @returns Order source distribution data
     */
    getOrderSourceDistribution: async (params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.ORDER_SOURCE_DISTRIBUTION, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get top selling items
     * @param params - Analytics parameters
     * @returns Top selling items data
     */
    getTopSellingItems: async (params: AnalyticsParams): Promise<ApiResponse<TopSellingItem[]>> => {
        return await apiRequest<ApiResponse<TopSellingItem[]>>(API_ENDPOINTS.TOP_SELLING_ITEMS, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get peak time slots
     * @param params - Analytics parameters
     * @returns Peak time slots data
     */
    getPeakTimeSlots: async (params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(API_ENDPOINTS.PEAK_TIME_SLOTS, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get sales report for outlet
     * @param outletId - Outlet ID
     * @param params - Analytics parameters
     * @returns Sales report data
     */
    getSalesReport: async (outletId: number, params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.SALES_REPORT}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get customer overview
     * @param outletId - Outlet ID
     * @param params - Analytics parameters
     * @returns Customer overview data
     */
    getCustomerOverview: async (outletId: number, params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.CUSTOMER_OVERVIEW}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get revenue split by source
     * @param outletId - Outlet ID
     * @param params - Analytics parameters
     * @returns Revenue split data
     */
    getRevenueSplit: async (outletId: number, params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.REVENUE_SPLIT}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get profit/loss trends
     * @param outletId - Outlet ID
     * @param params - Analytics parameters
     * @returns Profit/loss trends data
     */
    getProfitLossTrends: async (outletId: number, params: AnalyticsParams): Promise<ApiResponse<any>> => {
        return await apiRequest<ApiResponse<any>>(`${API_ENDPOINTS.PROFIT_LOSS_TRENDS}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },
};
