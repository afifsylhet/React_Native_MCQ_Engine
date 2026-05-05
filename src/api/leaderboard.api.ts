import axios from 'axios';
import apiClient from './client';
import { LeaderboardEntry, MyRank } from '../types/api.types';

interface LeaderboardResponse {
    items: LeaderboardEntry[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface LeaderboardParams {
    page?: number;
    limit?: number;
    studentType?: string;
    examType?: 'admission' | 'license';
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

export const leaderboardApi = {
    getWeeklyLeaderboard: async (params?: LeaderboardParams): Promise<LeaderboardResponse> => {
        try {
            const response = await apiClient.get<{ data: LeaderboardResponse }>('/leaderboard/weekly', {
                params,
            });
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                console.warn('[leaderboardApi] Weekly leaderboard unavailable for this user context');
                return {
                    items: [],
                    total: 0,
                    page: 1,
                    limit: params?.limit || 100,
                    pages: 0,
                };
            }
            console.error('[leaderboardApi] Get weekly leaderboard failed:', error);
            throw new Error(`Failed to fetch leaderboard: ${formatApiError(error)}`);
        }
    },

    getMyRank: async (): Promise<MyRank | null> => {
        try {
            const response = await apiClient.get<{ data: MyRank }>('/leaderboard/my-rank');
            return response.data.data;
        } catch (error) {
            // 404/400 are non-fatal for rank card: return null instead of error spam.
            if (
                axios.isAxiosError(error) &&
                (error.response?.status === 404 || error.response?.status === 400)
            ) {
                console.warn('[leaderboardApi] My rank unavailable for this user context');
                return null;
            }
            console.error('[leaderboardApi] Get my rank failed:', error);
            throw new Error(`Failed to fetch your rank: ${formatApiError(error)}`);
        }
    },
};
