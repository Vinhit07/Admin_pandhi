// Application Constants (TypeScript)
// Centralized location for routes, API endpoints, and permission types

/**
 * Frontend route paths
 */
export const ROUTES = {
    ADMIN_SIGN_IN: '/admin-signin',
    SUPERADMIN_SIGN_IN: '/superadmin-signin',
    DASHBOARD: '/',

    // Staff Management
    STAFF_MANAGEMENT: '/staff-management',

    // Product Management
    PRODUCT_MANAGEMENT: '/product-management',

    // Order Management
    ORDER_MANAGEMENT: '/order-management',

    // Inventory Management
    INVENTORY_MANAGEMENT: '/inventory-management',

    // Expenditure
    EXPENDITURE_MANAGEMENT: '/expenditure-management',

    // Wallet
    WALLET_MANAGEMENT: '/wallet-management',

    // Customer Management
    CUSTOMER_MANAGEMENT: '/customer-management',

    // Tickets
    TICKET_MANAGEMENT: '/ticket-management',

    // Notifications
    NOTIFICATIONS_MANAGEMENT: '/notifications-management',

    // App Management
    APP_MANAGEMENT: '/app-management',

    // Reports & Analytics
    REPORTS_ANALYTICS: '/reports-analytics',
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
    // Authentication
    ADMIN_SIGN_IN: '/auth/admin-signin',
    SUPERADMIN_SIGN_IN: '/auth/superadmin-signin',
    SIGN_OUT: '/auth/signout',
    CHECK_AUTH: '/auth/me',

    // Outlet Management
    GET_OUTLETS: '/superadmin/get-outlets/',
    ADD_OUTLET: '/superadmin/add-outlet/',
    REMOVE_OUTLET: '/superadmin/remove-outlet',

    // Staff Management
    GET_STAFFS: '/superadmin/outlets/get-staffs',
    GET_STAFF: '/superadmin/outlets/staff',
    ADD_STAFF: '/superadmin/outlets/add-staff/',
    UPDATE_STAFF: '/superadmin/outlets/update-staff',
    DELETE_STAFF: '/superadmin/outlets/delete-staff',
    UPDATE_PERMISSIONS: '/superadmin/outlets/permissions/',

    // Product Management
    GET_PRODUCTS: '/superadmin/outlets/get-products',
    ADD_PRODUCT: '/superadmin/outlets/add-product/',
    UPDATE_PRODUCT: '/superadmin/outlets/update-product',
    DELETE_PRODUCT: '/superadmin/outlets/delete-product',

    // Order Management
    GET_ORDERS: '/superadmin/outlets/:outletId/orders/',

    // Inventory Management
    GET_STOCKS: '/superadmin/outlets/get-stocks',
    ADD_STOCK: '/superadmin/outlets/add-stocks/',
    DEDUCT_STOCK: '/superadmin/outlets/deduct-stocks/',
    STOCK_HISTORY: '/superadmin/outlets/get-stock-history',

    // Expense Management
    ADD_EXPENSE: '/superadmin/outlets/add-expenses/',
    GET_EXPENSES: '/superadmin/outlets/get-expenses',
    GET_EXPENSES_BY_DATE: '/superadmin/outlets/get-expenses-bydate/',

    // Wallet Management
    GET_WALLET_HISTORY: '/superadmin/outlets/wallet-history',
    GET_RECHARGE_HISTORY: '/superadmin/outlets/recharge-history',
    GET_ORDERS_PAID_VIA_WALLET: '/superadmin/outlets/paid-wallet/',

    // Customer Management
    GET_CUSTOMERS: '/superadmin/outlets/customers',

    // Ticket Management
    GET_TICKETS: '/superadmin/outlets/tickets',
    CLOSE_TICKET: '/superadmin/outlets/ticket-close/',

    // Coupon Management
    CREATE_COUPON: '/superadmin/create-coupon/',
    GET_COUPONS: '/superadmin/get-coupons',
    DELETE_COUPON: '/superadmin/delete-coupon',

    // Notification Management
    LOW_STOCK_NOTIFICATIONS: '/superadmin/dashboard/low-stock-notifications',
    SCHEDULE_NOTIFICATION: '/superadmin/notifications/schedule',
    GET_SCHEDULED_NOTIFICATIONS: '/superadmin/notifications/scheduled',
    CANCEL_NOTIFICATION: '/superadmin/notifications/scheduled',
    SEND_IMMEDIATE_NOTIFICATION: '/superadmin/notifications/send-immediate',
    GET_NOTIFICATION_STATS: '/superadmin/notifications/stats',
    TEST_FCM: '/superadmin/notifications/fcm-status',
    TEST_SINGLE_DEVICE: '/superadmin/notifications/test-single',

    // App Management
    GET_NON_AVAILABILITY: '/superadmin/outlets/get-non-availability-preview',
    SET_AVAILABILITY: '/superadmin/outlets/set-availability/',
    GET_AVAILABLE_DATES: '/superadmin/outlets/get-available-dates',
    GET_APP_FEATURES: '/superadmin/outlets/app-features',
    UPDATE_APP_FEATURES: '/superadmin/outlets/app-features/',

    // Reports & Analytics
    SALES_REPORT: '/superadmin/outlets/sales-report',
    REVENUE_REPORT: '/superadmin/outlets/revenue-report',
    REVENUE_SPLIT: '/superadmin/outlets/revenue-split',
    WALLET_RECHARGE_BY_DAY: '/superadmin/outlets/wallet-recharge-by-day',
    PROFIT_LOSS_TRENDS: '/superadmin/outlets/profit-loss-trends',
    CUSTOMER_OVERVIEW: '/superadmin/outlets/customer-overview',
    CUSTOMER_PER_ORDER: '/superadmin/outlets/customer-per-order',

    // Dashboard Analytics
    DASHBOARD_OVERVIEW: '/superadmin/dashboard/overview',
    REVENUE_TREND: '/superadmin/dashboard/revenue-trend',
    ORDER_STATUS_DISTRIBUTION: '/superadmin/dashboard/order-status-distribution',
    ORDER_SOURCE_DISTRIBUTION: '/superadmin/dashboard/order-source-distribution',
    TOP_SELLING_ITEMS: '/superadmin/dashboard/top-selling-items',
    PEAK_TIME_SLOTS: '/superadmin/dashboard/peak-time-slots',

    // Admin Management (SuperAdmin only)
    PENDING_ADMINS: '/superadmin/pending-admins',
    VERIFY_ADMIN: '/superadmin/verify-admin',
    VERIFIED_ADMINS: '/superadmin/verified-admins',
    GET_ADMIN: '/superadmin/admin',
    DELETE_ADMIN: '/superadmin/admin',
    MAP_OUTLETS_TO_ADMIN: '/superadmin/map-outlets-to-admin',
    ASSIGN_ADMIN_PERMISSIONS: '/superadmin/assign-admin-permissions',

    // Staff Verification (SuperAdmin only)
    VERIFY_STAFF: '/superadmin/verify-staff',
    UNVERIFIED_STAFF: '/superadmin/unverified-staff',
    VERIFIED_STAFF: '/superadmin/verified-staff',
} as const;

/**
 * Permission types for role-based access control
 */
export const PERMISSIONS = {
    // Admin permissions
    MANAGE_STAFF: 'MANAGE_STAFF',
    MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
    MANAGE_ORDERS: 'MANAGE_ORDERS',
    MANAGE_INVENTORY: 'MANAGE_INVENTORY',
    MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',
    MANAGE_REPORTS: 'MANAGE_REPORTS',
    MANAGE_EXPENSES: 'MANAGE_EXPENSES',
    MANAGE_WALLET: 'MANAGE_WALLET',
    MANAGE_TICKETS: 'MANAGE_TICKETS',
    MANAGE_NOTIFICATIONS: 'MANAGE_NOTIFICATIONS',
    MANAGE_APP_FEATURES: 'MANAGE_APP_FEATURES',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Order status types
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
