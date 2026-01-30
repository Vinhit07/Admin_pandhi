// Product Management Service (TypeScript)
// Handles all product-related API calls for admin panel

import { apiRequest } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
    Product,
    ProductCreateRequest,
    ProductUpdateRequest,
    ApiResponse,
} from '../types/api';

export const productService = {
    /**
     * Get all products for an outlet
     * @param outletId - Outlet ID
     * @returns List of products
     */
    getProducts: async (outletId: number): Promise<ApiResponse<Product[]>> => {
        return await apiRequest<ApiResponse<Product[]>>(`${API_ENDPOINTS.GET_PRODUCTS}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Add new product
     * @param data - Product creation data
     * @returns Created product
     */
    addProduct: async (data: ProductCreateRequest): Promise<ApiResponse<Product>> => {
        return await apiRequest<ApiResponse<Product>>(API_ENDPOINTS.ADD_PRODUCT, {
            method: 'POST',
            body: data,
        });
    },

    /**
     * Update product
     * @param productId - Product ID
     * @param data - Updated product data
     * @returns Updated product
     */
    updateProduct: async (productId: number, data: ProductUpdateRequest): Promise<ApiResponse<Product>> => {
        return await apiRequest<ApiResponse<Product>>(`${API_ENDPOINTS.UPDATE_PRODUCT}/${productId}`, {
            method: 'PUT',
            body: data,
        });
    },

    /**
     * Delete product
     * @param productId - Product ID
     * @returns Success confirmation
     */
    deleteProduct: async (productId: number): Promise<ApiResponse<void>> => {
        return await apiRequest<ApiResponse<void>>(`${API_ENDPOINTS.DELETE_PRODUCT}/${productId}`, {
            method: 'DELETE',
        });
    },
};
