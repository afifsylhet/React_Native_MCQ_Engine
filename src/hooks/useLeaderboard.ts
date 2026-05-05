import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard.api';
import { queryKeys } from '../api/queryClient';

export const useLeaderboard = (params?: { studentType?: string; examType?: 'admission' | 'license' }) => {
    const studentType = params?.studentType;
    const examType = params?.examType;

    return useQuery({
        queryKey: [...queryKeys.leaderboard.weekly, studentType || 'all-student-types', examType || 'my-exam-type'],
        queryFn: () =>
            leaderboardApi.getWeeklyLeaderboard({
                limit: 100,
                studentType,
                examType,
            }),
        retry: (failureCount, error: any) => {
            const status = error?.response?.status;
            if (status === 400) return false;
            return failureCount < 1;
        },
    });
};

export const useMyRank = (enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.leaderboard.myRank,
        queryFn: () => leaderboardApi.getMyRank(),
        enabled,
    });
};
