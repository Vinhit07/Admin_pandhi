// Product Management Service (TypeScript)
// Handles all product-related API calls for admin panel

import { apiRequest, uploadFile } from '../lib/api';
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
     * Add new product with image upload
     * @param data - Product creation data
     * @param imageFile - Optional image file
     * @returns Created product
     */
    addProduct: async (data: ProductCreateRequest, imageFile?: File): Promise<ApiResponse<Product>> => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('price', data.price.toString());
        formData.append('category', data.category);
        formData.append('outletId', data.outletId.toString());

        // Add optional fields with defaults
        formData.append('threshold', data.threshold?.toString() || '10');
        formData.append('minValue', data.minValue?.toString() || '0');
        formData.append('isVeg', data.isVeg !== undefined ? String(data.isVeg) : 'true');
        formData.append('companyPaid', data.companyPaid !== undefined ? String(data.companyPaid) : 'false');

        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Use uploadFile from api.ts which handles FormData
        return await uploadFile<ApiResponse<Product>>(API_ENDPOINTS.ADD_PRODUCT, formData);
    },

    /**
     * Update product
     * @param productId - Product ID
     * @param data - Updated product data
     * @returns Updated product
     */
    updateProduct: async (productId: number, data: ProductUpdateRequest, imageFile?: File): Promise<ApiResponse<Product>> => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.price) formData.append('price', data.price.toString());
        if (data.category) formData.append('category', data.category);
        if (data.outletId) formData.append('outletId', data.outletId.toString());

        // Add optional fields
        if (data.threshold) formData.append('threshold', data.threshold.toString());
        if (data.minValue) formData.append('minValue', data.minValue.toString());
        if (data.isVeg !== undefined) formData.append('isVeg', String(data.isVeg));
        if (data.companyPaid !== undefined) formData.append('companyPaid', String(data.companyPaid));
        if (data.isAvailable !== undefined) formData.append('isAvailable', String(data.isAvailable));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        return await uploadFile<ApiResponse<Product>>(`${API_ENDPOINTS.UPDATE_PRODUCT}/${productId}`, formData, 'PUT');
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
