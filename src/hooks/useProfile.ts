import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { queryClient, queryKeys } from '../api/queryClient';

export const useProfile = () => {
    const profileQuery = useQuery({
        queryKey: queryKeys.user.profile,
        queryFn: () => userApi.getUserProfile(),
    });

    const statsQuery = useQuery({
        queryKey: queryKeys.user.stats,
        queryFn: () => userApi.getUserStatistics(),
    });

    const updateProfileMutation = useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
        },
    });

    return {
        profile: profileQuery.data,
        stats: statsQuery.data,
        isLoading: profileQuery.isLoading || statsQuery.isLoading,
        error: profileQuery.error || statsQuery.error,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,
    };
};
