import apiClient from './client';
import axios from 'axios';
import {
    SubscriptionPlan,
    Subscription,
    Pagination,
} from '../types/api.types';
import { SubscribePayload } from '../types/subscription.types';

interface SubscriptionHistoryResponse {
    items: Subscription[];
    pagination: Pagination;
}

interface CancelResponse {
    message: string;
    cancelled: boolean;
}

export interface ModuleStatusResponse {
    examType: 'admission' | 'license';
    studentType: string;
    isLocked: boolean;
    lockReason: string | null;
    label: string;
    message: string;
    updatedAt: string | null;
}

/**
 * Formats API errors into readable error messages
 */
const formatApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const subscriptionApi = {
    getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
        try {
            const response = await apiClient.get<{ data: SubscriptionPlan[] }>('/subscriptions/plans');
            return response.data.data;
        } catch (error) {
            console.error('[subscriptionApi] Get plans failed:', error);
            throw new Error(`Failed to fetch subscription plans: ${formatApiError(error)}`);
        }
    },

    subscribeToPlan: async (payload: SubscribePayload): Promise<Subscription> => {
        try {
            const response = await apiClient.post<{ data: Subscription }>(
                '/subscriptions/subscribe',
                payload
            );
            return response.data.data;
        } catch (error) {
            console.error('[subscriptionApi] Subscribe failed:', error);
            throw error;
        }
    },

    getMySubscription: async (): Promise<Subscription> => {
        try {
            const response = await apiClient.get<{ data: Subscription }>('/subscriptions/my');
            return response.data.data;
        } catch (error) {
            console.error('[subscriptionApi] Get subscription failed:', error);
            throw new Error(`Failed to fetch subscription: ${formatApiError(error)}`);
        }
    },

    getMyModuleStatus: async (
        _fallback?: { examType?: 'admission' | 'license'; studentType?: string }
    ): Promise<ModuleStatusResponse> => {
        try {
            const response = await apiClient.get<{ data: ModuleStatusResponse }>('/subscriptions/module-status');
            return response.data.data;
        } catch (error) {
            // Do NOT silently coerce 400 into isLocked:true — that masked real admin
            // lock/unlock state and made the maintenance page appear regardless of
            // the PreparationModule collection's value. Backend's assertModuleAvailable
            // is the authoritative gate at action time (generate exam / subscribe).
            console.error('[subscriptionApi] Get module status failed:', error);
            throw new Error(`Failed to fetch module status: ${formatApiError(error)}`);
        }
    },

    getSubscriptionHistory: async (
        page: number = 1
    ): Promise<SubscriptionHistoryResponse> => {
        try {
            const response = await apiClient.get<{ data: SubscriptionHistoryResponse }>('/subscriptions/history', {
                params: { page },
            });
            return response.data.data;
        } catch (error) {
            console.error('[subscriptionApi] Get history failed:', error);
            throw new Error(`Failed to fetch subscription history: ${formatApiError(error)}`);
        }
    },

    cancelSubscription: async (): Promise<CancelResponse> => {
        try {
            const response = await apiClient.post<{ data: CancelResponse }>('/subscriptions/cancel');
            return response.data.data;
        } catch (error) {
            console.error('[subscriptionApi] Cancel subscription failed:', error);
            throw new Error(`Failed to cancel subscription: ${formatApiError(error)}`);
        }
    },

    getPublicModuleStatuses: async (): Promise<{ examType: string; studentType: string; isLocked: boolean }[]> => {
        try {
            const response = await apiClient.get<{
                data: { examType: string; studentType: string; isLocked: boolean }[];
            }>('/subscriptions/public/module-statuses');
            return response.data.data || [];
        } catch (error) {
            console.error('[subscriptionApi] Get public module statuses failed:', error);
            return [];
        }
    },
};
