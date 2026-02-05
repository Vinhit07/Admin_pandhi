// API Types
// TypeScript interfaces for API requests and responses

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    imageUrl?: string;
    role: 'ADMIN' | 'SUPERADMIN' | 'STAFF' | 'CUSTOMER';
    adminDetails?: AdminDetails;
    outlet?: Outlet;
    staffDetails?: StaffDetails;
    customerDetails?: CustomerDetails;
}

export interface AdminDetails {
    isVerified: boolean;
    permissions?: Permission[];
    outlets?: Outlet[];
}

export interface StaffDetails {
    permissions?: Permission[];
}

export interface CustomerDetails {
    walletBalance?: number;
}

export interface Outlet {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface Permission {
    type: string;
    isGranted: boolean;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================================================
// Staff Management Types
// ============================================================================

export interface Staff {
    id: number;
    name: string;
    email: string;
    phone?: string;
    imageUrl?: string;
    designation?: string;
    outletId: number;
    outlet?: Outlet;
    staffDetails?: StaffDetails;
    createdAt?: string;
}

export interface StaffCreateRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    designation?: string;
    outletId: number;
}

export interface StaffUpdateRequest {
    name?: string;
    email?: string;
    phone?: string;
    designation?: string;
}

export interface PermissionUpdateRequest {
    staffId: number;
    permissions: {
        type: string;
        isGranted: boolean;
    }[];
}

// ============================================================================
// Product Management Types
// ============================================================================

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category?: string;
    imageUrl?: string;
    isAvailable: boolean;
    outletId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductCreateRequest {
    name: string;
    description?: string;
    price: number;
    category?: string;
    imageUrl?: string;
    outletId: number;
}

export interface ProductUpdateRequest {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    imageUrl?: string;
    isAvailable?: boolean;
}

// ============================================================================
// Order Management Types
// ============================================================================

export interface Order {
    id: string;
    customerId: number;
    outletId: number;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    orderType: OrderType;
    deliveryTime?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

// ============================================================================
// Inventory Types
// ============================================================================

export interface Stock {
    id: number;
    productId: number;
    product?: Product;
    quantity: number;
    unit?: string;
    lowStockThreshold?: number;
    outletId: number;
}

export interface StockTransaction {
    id: number;
    productId: number;
    productName?: string;
    type: 'ADD' | 'DEDUCT';
    quantity: number;
    reason?: string;
    performedBy?: number;
    performedByName?: string;
    createdAt: string;
}

export interface StockUpdateRequest {
    productId: number;
    quantity: number;
    reason?: string;
    outletId: number;
}

// ============================================================================
// Customer Management Types
// ============================================================================

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    walletBalance?: number;
    totalOrders?: number;
    totalSpent?: number;
    createdAt?: string;
}

// ============================================================================
// Wallet Management Types
// ============================================================================

export interface WalletTransaction {
    id: number;
    customerId: number;
    customerName?: string;
    amount: number;
    type: 'RECHARGE' | 'DEBIT' | 'REFUND';
    paymentMethod?: string;
    orderId?: string;
    createdAt: string;
}

export interface RechargeRequest {
    customerId: number;
    amount: number;
    paymentMethod: string;
    outletId: number;
}

// ============================================================================
// Ticket Management Types
// ============================================================================

export interface Ticket {
    id: number;
    customerId: number;
    customerName?: string;
    outletId: number;
    orderId?: string;
    issueType: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    resolvedAt?: string;
}

export interface TicketCloseRequest {
    ticketId: number;
    resolution?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationSchedule {
    id: number;
    title: string;
    message: string;
    targetAudience: 'ALL' | 'SPECIFIC';
    targetUserIds?: number[];
    scheduledFor: string;
    status: 'PENDING' | 'SENT' | 'CANCELLED';
    outletId: number;
    createdAt: string;
}

export interface NotificationRequest {
    title: string;
    message: string;
    targetAudience: 'ALL' | 'SPECIFIC';
    targetUserIds?: number[];
    scheduledFor?: string;
    outletId: number;
}

// ============================================================================
// Analytics & Reports Types
// ============================================================================

export interface DashboardOverview {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    revenueChange?: number;
    ordersChange?: number;
    customersChange?: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface CategoryBreakdown {
    category: string;
    count: number;
    revenue: number;
}

export interface TopSellingItem {
    productId: number;
    productName: string;
    quantitySold: number;
    revenue: number;
}

export interface AnalyticsParams {
    startDate: string;
    endDate: string;
    interval?: 'day' | 'week' | 'month';
}

export interface OrderStatusDistribution {
    delivered: number;
    pending: number;
    cancelled: number;
    partiallyDelivered: number;
}

export interface OrderSourceDistribution {
    appOrders: number;
    manualOrders: number;
}

export interface PeakTimeSlot {
    timeSlot: string;
    displayName: string;
    orderCount: number;
}

// ============================================================================
// Coupon Types
// ============================================================================

export interface Coupon {
    id: number;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom: string;
    validTo: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    outletId: number;
}

export interface CouponCreateRequest {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom: string;
    validTo: string;
    usageLimit?: number;
    outletId: number;
}

// ============================================================================
// Expense Types
// ============================================================================

export interface Expense {
    id: number;
    category: string;
    amount: number;
    description?: string;
    date: string;
    outletId: number;
    createdBy?: number;
    createdByName?: string;
    createdAt: string;
}

export interface ExpenseCreateRequest {
    category: string;
    amount: number;
    description?: string;
    date: string;
    outletId: number;
}
