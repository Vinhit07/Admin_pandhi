// Notification & Coupon Management Service (Admin TypeScript)
// Handles notification scheduling and coupon management

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ApiResponse, NotificationSchedule, NotificationRequest, Coupon, CouponCreateRequest } from '../types/api';

export const notificationService = {
    /**
     * Get scheduled notifications for an outlet
     * @param outletId - Outlet ID
     * @returns List of scheduled notifications
     */
    getScheduledNotifications: async (outletId: number | string): Promise<ApiResponse<NotificationSchedule[]>> => {
        return await apiRequest<ApiResponse<NotificationSchedule[]>>(`${API_ENDPOINTS.GET_SCHEDULED_NOTIFICATIONS}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Schedule new notification
     * @param data - Notification data
     * @returns Created notification
     */
    scheduleNotification: async (data: NotificationRequest): Promise<ApiResponse<NotificationSchedule>> => {
        return await apiRequest<ApiResponse<NotificationSchedule>>(API_ENDPOINTS.SCHEDULE_NOTIFICATION, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Cancel/Delete notification
     * @param notificationId - Notification ID
     * @returns Success response
     */
    cancelNotification: async (notificationId: number): Promise<ApiResponse<void>> => {
        return await apiRequest<ApiResponse<void>>(`${API_ENDPOINTS.CANCEL_NOTIFICATION}/${notificationId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get active coupons for an outlet
     * @param outletId - Outlet ID
     * @returns List of coupons
     */
    getCoupons: async (outletId: number | string): Promise<ApiResponse<Coupon[]>> => {
        return await apiRequest<ApiResponse<Coupon[]>>(`${API_ENDPOINTS.GET_COUPONS}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Create new coupon
     * @param data - Coupon data
     * @returns Created coupon
     */
    createCoupon: async (data: CouponCreateRequest): Promise<ApiResponse<Coupon>> => {
        return await apiRequest<ApiResponse<Coupon>>(API_ENDPOINTS.CREATE_COUPON, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Delete coupon
     * @param couponId - Coupon ID
     * @returns Success response
     */
    deleteCoupon: async (couponId: number): Promise<ApiResponse<void>> => {
        return await apiRequest<ApiResponse<void>>(`${API_ENDPOINTS.DELETE_COUPON}/${couponId}`, {
            method: 'DELETE',
        });
    },
};
