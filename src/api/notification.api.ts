import apiClient from './client';
import { Notification, Pagination } from '../types/api.types';

interface NotificationsResponse {
    notifications: Notification[];
    pagination: Pagination;
    unreadCount: number;
}

interface NotificationFilters {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
    order?: 'asc' | 'desc';
}

interface DeleteResponse {
    message: string;
    deleted: boolean;
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

export const notificationApi = {
    getNotifications: async (
        params: NotificationFilters
    ): Promise<NotificationsResponse> => {
        try {
            const response = await apiClient.get<{ data: NotificationsResponse }>('/notifications', { params });
            return response.data.data;
        } catch (error) {
            console.error('[notificationApi] Get notifications failed:', error);
            throw new Error(`Failed to fetch notifications: ${formatApiError(error)}`);
        }
    },

    markAsRead: async (notificationId: string): Promise<Notification> => {
        try {
            const response = await apiClient.patch<{ data: Notification }>(
                `/notifications/${notificationId}/read`
            );
            return response.data.data;
        } catch (error) {
            console.error('[notificationApi] Mark as read failed:', error);
            throw new Error(`Failed to mark notification as read: ${formatApiError(error)}`);
        }
    },

    markAllAsRead: async (): Promise<{ message: string }> => {
        try {
            const response = await apiClient.patch<{ data: { message: string } }>('/notifications/read-all');
            return response.data.data;
        } catch (error) {
            console.error('[notificationApi] Mark all as read failed:', error);
            throw new Error(`Failed to mark all as read: ${formatApiError(error)}`);
        }
    },

    deleteNotification: async (notificationId: string): Promise<DeleteResponse> => {
        try {
            const response = await apiClient.delete<{ data: DeleteResponse }>(
                `/notifications/${notificationId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('[notificationApi] Delete notification failed:', error);
            throw new Error(`Failed to delete notification: ${formatApiError(error)}`);
        }
    },
};
