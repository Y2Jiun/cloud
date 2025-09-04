export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthResponse {
    user: User;
    token: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface DashboardStats {
    totalUsers: number;
    totalCustomers: number;
    totalRevenue: number;
    totalOrders: number;
    recentActivity: Activity[];
}
export interface Activity {
    id: string;
    type: 'user_registered' | 'order_created' | 'customer_updated';
    description: string;
    timestamp: Date;
    userId?: string;
}
export interface FileUploadResponse {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
}
//# sourceMappingURL=index.d.ts.map