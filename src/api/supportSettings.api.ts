import apiClient from './client';
import { SupportSettings, SupportSettingsPayload } from '../types/supportSettings.types';

const formatApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const supportSettingsApi = {
    getSupportSettings: async (): Promise<SupportSettings> => {
        try {
            const response = await apiClient.get<{ data: SupportSettings }>('/settings/support');
            return response.data.data;
        } catch (error) {
            console.error('[supportSettingsApi] Get support settings failed:', error);
            throw new Error(`Failed to fetch support settings: ${formatApiError(error)}`);
        }
    },

    updateSupportSettings: async (payload: SupportSettingsPayload): Promise<SupportSettings> => {
        try {
            const response = await apiClient.put<{ data: SupportSettings }>(
                '/settings/support',
                payload
            );
            return response.data.data;
        } catch (error) {
            console.error('[supportSettingsApi] Update support settings failed:', error);
            throw new Error(`Failed to update support settings: ${formatApiError(error)}`);
        }
    },
};
