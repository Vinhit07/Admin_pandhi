// Authentication Context (TypeScript)
// Manages global authentication state with role-based access and outlet management

import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, Outlet, Permission } from '../types/api';

// Action types
const ActionType = {
    LOADING: 'LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    ERROR: 'ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
} as const;

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    outlets: Outlet[];
    permissions: Permission[];
    loading: boolean;
    error: string | null;
}

type AuthAction =
    | { type: typeof ActionType.LOADING }
    | { type: typeof ActionType.LOGIN_SUCCESS; payload: { user: User; outlets: Outlet[]; permissions: Permission[] } }
    | { type: typeof ActionType.LOGOUT }
    | { type: typeof ActionType.ERROR; payload: string }
    | { type: typeof ActionType.CLEAR_ERROR };

interface AuthContextValue extends AuthState {
    adminSignIn: (credentials: { email: string; password: string }) => Promise<void>;
    superAdminSignIn: (credentials: { email: string; password: string }) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
    hasPermission: (permissionType: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reducer to manage auth state
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case ActionType.LOADING:
            return { ...state, loading: true, error: null };

        case ActionType.LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                outlets: action.payload.outlets,
                permissions: action.payload.permissions,
                error: null,
            };

        case ActionType.LOGOUT:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                outlets: [],
                permissions: [],
                error: null,
            };

        case ActionType.ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ActionType.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

// Initial state
const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    outlets: [],
    permissions: [],
    loading: true,
    error: null,
};

/**
 * AuthProvider Component
 * Wraps the application to provide auth state and methods
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Helper: Clear error
    const clearError = useCallback(() => {
        dispatch({ type: ActionType.CLEAR_ERROR });
    }, []);

    // Helper: Check if user has specific permission
    const hasPermission = useCallback((permissionType: string): boolean => {
        return state.permissions.some(
            (perm) => perm.type === permissionType && perm.isGranted === true
        );
    }, [state.permissions]);

    // Check auth status on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Token exists - verify it with backend
            checkAuthStatus();
        } else {
            // No token - immediately set to logged out (no API call needed)
            console.log('No token found - setting to logged out state');
            dispatch({ type: ActionType.LOGOUT });
        }
    }, []);

    // Check authentication status
    const checkAuthStatus = async () => {
        dispatch({ type: ActionType.LOADING });
        try {
            const response = await authService.checkAuth();
            if (response && (response.user || response.admin || response.superadmin)) {

                const user = response.user || response.admin || response.superadmin;

                const userData = {
                    user: user,
                    outlets: user.adminDetails?.outlets || user.outlets || [],
                    permissions: user.adminDetails?.permissions || user.permissions || [],
                };

                dispatch({ type: ActionType.LOGIN_SUCCESS, payload: userData });
            } else {
                // No user data returned - clear any stale tokens and logout
                localStorage.removeItem('token');
                localStorage.removeItem('outletDetails');
                dispatch({ type: ActionType.LOGOUT });
            }
        } catch (error) {
            // Auth check failed - likely invalid/expired token
            // Clear tokens silently and show login page
            console.log('Authentication check failed - clearing session');
            localStorage.removeItem('token');
            localStorage.removeItem('outletDetails');
            sessionStorage.removeItem('last_401_redirect');
            dispatch({ type: ActionType.LOGOUT });
        }
    };

    // Admin sign in
    const adminSignIn = async (credentials: { email: string; password: string }) => {
        dispatch({ type: ActionType.LOADING });
        try {
            const response = await authService.adminSignIn(credentials);
            console.log('Admin SignIn success:', response);

            const user = response.user || response.admin;

            if (!user) {
                throw new Error('Invalid response from server');
            }

            // Normalize data extraction based on response structure
            const outlets = user.outlets || user.adminDetails?.outlets || [];
            const permissions = user.permissions || user.adminDetails?.permissions || [];

            const loginData = {
                user: user,
                outlets: outlets,
                permissions: permissions,
            };

            dispatch({ type: ActionType.LOGIN_SUCCESS, payload: loginData });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
            console.error('Admin SignIn error:', error);
            dispatch({ type: ActionType.ERROR, payload: errorMessage });
            throw error;
        }
    };

    // SuperAdmin sign in
    const superAdminSignIn = async (credentials: { email: string; password: string }) => {
        dispatch({ type: ActionType.LOADING });
        try {
            const response = await authService.superAdminSignIn(credentials);
            console.log('SuperAdmin SignIn success:', response);

            if (!response.user) {
                throw new Error('Invalid response from server');
            }

            const loginData = {
                user: response.user,
                outlets: [], // SuperAdmin has access to all outlets
                permissions: [], // SuperAdmin has all permissions by default
            };

            dispatch({ type: ActionType.LOGIN_SUCCESS, payload: loginData });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
            console.error('SuperAdmin SignIn error:', error);
            dispatch({ type: ActionType.ERROR, payload: errorMessage });
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        dispatch({ type: ActionType.LOADING });
        try {
            await authService.signOut();
            dispatch({ type: ActionType.LOGOUT });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
            dispatch({ type: ActionType.ERROR, payload: errorMessage });
            dispatch({ type: ActionType.LOGOUT });
        }
    };

    const value: AuthContextValue = {
        ...state,
        adminSignIn,
        superAdminSignIn,
        signOut,
        clearError,
        hasPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext };
