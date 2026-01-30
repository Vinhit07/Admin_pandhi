// API Base Configuration and Request Handler (TypeScript)
// Type-safe API client with JWT authentication and error handling

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api';

if (!import.meta.env.VITE_API_URL) {
    console.warn('⚠️ VITE_API_URL is not set in .env file. Using fallback: http://localhost:5500/api');
    console.warn('For production, please create a .env file from .env.example');
}

/**
 * API Request Options
 */
interface ApiRequestOptions extends RequestInit {
    body?: any;
}

/**
 * Main API request function with automatic token injection and error handling
 * @param endpoint - API endpoint (e.g., '/auth/signin')
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export const apiRequest = async <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');

    // Build request configuration
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    };

    // Automatically stringify body if it's an object
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            // Handle non-JSON responses
            const text = await response.text();
            console.error('Non-JSON response received:', text);
            throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
        }

        const data = await response.json();

        // Handle HTTP errors
        if (!response.ok) {
            // Auto-logout on 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('outletDetails');
                window.location.href = '/admin-signin';
                throw new Error('Session expired. Please login again.');
            }

            throw new Error(data.message || response.statusText);
        }

        return data as T;
    } catch (error) {
        // Enhanced error logging for debugging
        console.error('API Request failed:', {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
};

/**
 * Upload file with multipart/form-data
 * Used for image uploads and file attachments
 * @param endpoint - API endpoint
 * @param formData - FormData object with file
 * @returns Parsed JSON response
 */
export const uploadFile = async <T = any>(
    endpoint: string,
    formData: FormData
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            // Don't set Content-Type for FormData - browser will set it automatically
        },
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
    }

    return response.json() as Promise<T>;
};
