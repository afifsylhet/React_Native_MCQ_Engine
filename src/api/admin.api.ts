import apiClient from './client';
import { User, Question, PaginatedResponse } from '../types/api.types';

export interface AdminSubscription {
    _id: string;
    plan: 'quarterly' | 'half_yearly';
    price: number;
    currency: string;
    paymentMethod?: string | null;
    transactionId?: string | null;
    paymentAmount?: number | null;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    startDate: string;
    endDate: string;
    isActive: boolean;
    user: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
    approvedBy?: { _id: string; fullName: string; email: string } | null;
    approvedAt?: string | null;
    createdAt: string;
}

export type PendingSubscription = AdminSubscription;

export interface AdminSubscriptionsResponse {
    subscriptions: AdminSubscription[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export type PendingSubscriptionsResponse = AdminSubscriptionsResponse;

export interface ActiveSubscriptionFilters {
    search?: string;
    plan?: 'quarterly' | 'half_yearly';
    page?: number;
    limit?: number;
}

export interface GetUsersFilters {
    studentType?: string;
    role?: 'student' | 'instructor' | 'admin';
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ReportedQuestion extends Question {
    reportCount?: number;
    report?: {
        isReported?: boolean;
        adminReview?: {
            action?: 'resolved' | 'dismissed' | 'deleted' | 'pending' | null;
            reviewedAt?: string | null;
        };
        reports?: {
            _id?: string;
            reportedAt?: string;
            createdAt?: string;
        }[];
    };
    reports?: {
        _id: string;
        reportedBy: string;
        reason: string;
        description?: string;
        createdAt: string;
    }[];
}

export interface AdminStats {
    totalUsers: number;
    totalQuestions: number;
    totalExamAttempts: number;
    reportedQuestionsCount: number;
    activeAdmins: number;
}

export interface AdminPreparationModule {
    examType: 'admission' | 'license';
    studentType: string;
    isLocked: boolean;
    lockReason: string | null;
    label: string;
    message: string;
    updatedAt: string | null;
}

export const adminApi = {
    // ========== USER MANAGEMENT ==========

    /**
     * Get all users (paginated)
     */
    getAllUsers: async (filters: GetUsersFilters) => {
        const params = new URLSearchParams();
        if (filters.studentType) params.append('studentType', filters.studentType);
        if (filters.role) params.append('role', filters.role);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.search) params.append('search', filters.search);
        params.append('page', (filters.page || 1).toString());
        params.append('limit', (filters.limit || 20).toString());

        const response = await apiClient.get(
            `/users?${params.toString()}`
        );
        return response.data.data;
    },

    /**
     * Deactivate a user account by email
     */
    deactivateUser: async (email: string) => {
        const response = await apiClient.post('/users/deactivate', { email });
        return response.data;
    },

    /**
     * Reactivate a deactivated user account by email
     */
    reactivateUser: async (email: string) => {
        const response = await apiClient.post('/users/reactivate', { email });
        return response.data;
    },

    // ========== QUESTION MANAGEMENT ==========

    /**
     * Create a new question (MCQ or True/False)
     */
    createQuestion: async (questionData: Partial<Question>) => {
        const response = await apiClient.post('/questions', questionData);
        return response.data.data;
    },

    /**
     * Update an existing question
     */
    updateQuestion: async (questionId: string, updates: Partial<Question>) => {
        const response = await apiClient.patch(`/questions/${questionId}`, updates);
        return response.data.data;
    },

    /**
     * Get a single question by ID (admin only)
     */
    getQuestion: async (questionId: string) => {
        const response = await apiClient.get(`/questions/admin/${questionId}`);
        return response.data.data;
    },

    /**
     * Delete a question
     */
    deleteQuestion: async (questionId: string) => {
        const response = await apiClient.delete(`/questions/${questionId}`);
        return response.data;
    },

    /**
     * Get a single user by ID or email
     */
    getUser: async (identifier: string) => {
        const response = await apiClient.get(`/users/detail/${identifier}`);
        return response.data.data;
    },

    /**
     * Get all reported questions
     */
    getReportedQuestions: async (page: number = 1, limit: number = 20) => {
        const response = await apiClient.get(
            `/questions/reports/list?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    /**
     * Get reports for a specific question
     */
    getQuestionReports: async (questionId: string) => {
        const response = await apiClient.get(`/questions/${questionId}/reports`);
        return response.data.data;
    },

    /**
     * Clear reports from a question with action taken.
     * 'resolved' — reports addressed; 'dismissed' — reports ignored, question kept as-is;
     * 'deleted' — question soft-deleted (isActive=false) in addition to clearing reports.
     */
    clearReports: async (
        questionId: string,
        action: 'resolved' | 'dismissed' | 'deleted',
        adminNotes?: string
    ) => {
        const response = await apiClient.patch(
            `/questions/reports/${questionId}/clear`,
            {
                action,
                adminNotes: adminNotes || '',
            }
        );
        return response.data.data;
    },

    // ========== SUBSCRIPTION MANAGEMENT ==========

    /**
     * List subscriptions awaiting admin approval
     */
    getPendingSubscriptions: async (
        page: number = 1,
        limit: number = 20
    ): Promise<PendingSubscriptionsResponse> => {
        const response = await apiClient.get(
            `/subscriptions/admin/pending?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    /**
     * Approve a pending subscription
     */
    approveSubscription: async (subscriptionId: string) => {
        const response = await apiClient.post(
            `/subscriptions/admin/${subscriptionId}/approve`
        );
        return response.data.data;
    },

    /**
     * Reject a pending subscription
     */
    rejectSubscription: async (subscriptionId: string, reason?: string) => {
        const response = await apiClient.post(
            `/subscriptions/admin/${subscriptionId}/reject`,
            { reason: reason || '' }
        );
        return response.data.data;
    },

    /**
     * List all currently active (approved) subscriptions with search/filter
     */
    getActiveSubscriptions: async (
        filters: ActiveSubscriptionFilters = {}
    ): Promise<AdminSubscriptionsResponse> => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.plan) params.append('plan', filters.plan);
        params.append('page', (filters.page || 1).toString());
        params.append('limit', (filters.limit || 20).toString());

        const response = await apiClient.get(
            `/subscriptions/admin/active?${params.toString()}`
        );
        return response.data.data;
    },

    /**
     * Admin-initiated cancellation of an active subscription
     */
    cancelUserSubscription: async (subscriptionId: string, reason?: string) => {
        const response = await apiClient.post(
            `/subscriptions/admin/${subscriptionId}/cancel`,
            { reason: reason || '' }
        );
        return response.data.data;
    },

    /**
     * Admin-initiated subscription activation for a user
     */
    adminSubscribeUser: async (
        userId: string,
        plan: 'quarterly' | 'half_yearly'
    ): Promise<AdminSubscription> => {
        const response = await apiClient.post('/subscriptions/admin/subscribe-user', {
            userId,
            plan,
        });
        return response.data.data;
    },

    /**
     * Get all invoice/subscription records for a specific user (admin only)
     */
    getUserInvoices: async (
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<AdminSubscriptionsResponse> => {
        const response = await apiClient.get(
            `/subscriptions/admin/user/${userId}/invoices?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    // ========== DASHBOARD ==========

    /**
     * Get admin dashboard statistics
     */
    getDashboardStats: async (): Promise<AdminStats> => {
        const response = await apiClient.get('/admin/stats');
        return response.data.data;
    },

    getPreparationModules: async (): Promise<AdminPreparationModule[]> => {
        const response = await apiClient.get('/admin/preparation-modules');
        return response.data.data;
    },

    updatePreparationModule: async (
        examType: 'admission' | 'license',
        studentType: string,
        isLocked: boolean
    ): Promise<AdminPreparationModule> => {
        const response = await apiClient.patch(
            `/admin/preparation-modules/${examType}/${studentType}`,
            { isLocked }
        );
        return response.data.data;
    },
};
