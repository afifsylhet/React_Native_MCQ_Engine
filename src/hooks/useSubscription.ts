import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription.api';
import { queryClient, queryKeys } from '../api/queryClient';
import { SubscribePayload } from '../types/subscription.types';
import { useAuth } from './useAuth';

export const useSubscriptionPlans = () => {
    return useQuery({
        queryKey: queryKeys.subscription.plans,
        queryFn: () => subscriptionApi.getSubscriptionPlans(),
    });
};

export const useMySubscription = () => {
    return useQuery({
        queryKey: queryKeys.subscription.my,
        queryFn: () => subscriptionApi.getMySubscription(),
    });
};

export const useMyModuleStatus = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['subscription', 'module-status'],
        queryFn: () =>
            subscriptionApi.getMyModuleStatus({
                examType: user?.examType,
                studentType: user?.studentType,
            }),
        enabled: !!user,
        retry: (failureCount, error: any) => {
            const status = error?.response?.status;
            if (status === 400) return false;
            return failureCount < 1;
        },
        // Always refetch on mount — an admin can flip lock state at any moment and
        // users must not act on stale "unlocked" cache.
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnReconnect: 'always',
    });
};

export const useSubscribeToPlan = () => {
    return useMutation({
        mutationFn: (payload: SubscribePayload) =>
            subscriptionApi.subscribeToPlan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.subscription.my });
            queryClient.invalidateQueries({
                queryKey: queryKeys.subscription.history,
            });
        },
    });
};

export const useCancelSubscription = () => {
    return useMutation({
        mutationFn: () => subscriptionApi.cancelSubscription(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.subscription.my });
        },
    });
};

// Convenience hook that combines multiple subscription operations
export const useSubscription = () => {
    const { data: mySubscription, isLoading: isLoadingSubscription } =
        useMySubscription();
    const subscribeMutation = useSubscribeToPlan();
    const cancelMutation = useCancelSubscription();

    return {
        mySubscription,
        isLoading: isLoadingSubscription,
        subscribe: subscribeMutation.mutate,
        isSubscribing: subscribeMutation.isPending,
        cancelSubscription: cancelMutation.mutate,
        isCanceling: cancelMutation.isPending,
    };
};
