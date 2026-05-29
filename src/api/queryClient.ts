import { QueryClient } from '@tanstack/react-query';

// Create React Query client with optimized settings
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Centralized query key factory
export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },

    user: {
        profile: ['user', 'profile'] as const,
        stats: ['user', 'stats'] as const,
    },

    exam: {
        history: (page: number, category?: string) =>
            ['exam', 'history', page, category] as const,
        detail: (id: string) => ['exam', 'detail', id] as const,
        result: (id: string) => ['exam', 'result', id] as const,
        attempt: (id: string) => ['exam', 'attempt', id] as const,
        quota: ['exam', 'quota'] as const,
    },

    leaderboard: {
        weekly: ['leaderboard', 'weekly'] as const,
        myRank: ['leaderboard', 'my-rank'] as const,
    },

    subscription: {
        my: ['subscription', 'my'] as const,
        plans: ['subscription', 'plans'] as const,
        history: () => ['subscription', 'history'] as const,
        weeklyQuota: ['subscription', 'weekly-quota'] as const,
    },

    notifications: {
        list: (page: number) => ['notifications', page] as const,
    },

    question: {
        subjects: (studentType: string, examType: string) =>
            ['questions', 'subjects', studentType, examType] as const,
        all: (filters?: Record<string, any>) =>
            ['questions', 'all', filters] as const,
    },

    notice: {
        list: (page: number, activeOnly: boolean) =>
            ['notice', 'list', page, activeOnly] as const,
        detail: (id: string) => ['notice', 'detail', id] as const,
    },
};
