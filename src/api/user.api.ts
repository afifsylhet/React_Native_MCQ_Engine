import apiClient from './client';
import { User, UserStatistics } from '../types/api.types';

interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
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

export const userApi = {
    getUserProfile: async (): Promise<User> => {
        try {
            const response = await apiClient.get<{ data: User }>('/users/profile');
            return response.data.data;
        } catch (error) {
            console.error('[userApi] Get profile failed:', error);
            throw new Error(`Failed to fetch profile: ${formatApiError(error)}`);
        }
    },

    updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
        try {
            // Transform frontend field names to backend field names
            const backendPayload: any = {};

            // Combine firstName and lastName into fullName
            if (payload.firstName || payload.lastName) {
                backendPayload.fullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
            }

            // Map phone to phoneNumber
            if (payload.phone) {
                backendPayload.phoneNumber = payload.phone;
            }

            const response = await apiClient.patch<{ data: User }>('/users/profile', backendPayload);
            return response.data.data;
        } catch (error) {
            console.error('[userApi] Update profile failed:', error);
            throw new Error(`Failed to update profile: ${formatApiError(error)}`);
        }
    },

    getUserStatistics: async (): Promise<UserStatistics> => {
        try {
            const response = await apiClient.get<{ data: UserStatistics }>('/users/statistics');
            return response.data.data;
        } catch (error) {
            console.error('[userApi] Get statistics failed:', error);
            throw new Error(`Failed to fetch statistics: ${formatApiError(error)}`);
        }
    },

    savePushToken: async (token: string): Promise<void> => {
        try {
            await apiClient.post('/users/push-token', { token });
        } catch (error) {
            console.error('[userApi] Save push token failed:', error);
        }
    },
};
