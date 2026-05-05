import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { queryClient, queryKeys } from '../api/queryClient';

export const useNotifications = () => {
    const query = useInfiniteQuery({
        queryKey: [queryKeys.notifications.list(1)],
        queryFn: ({ pageParam = 1 }) =>
            notificationApi.getNotifications({
                page: pageParam,
                limit: 20,
                order: 'desc',
            }),
        getNextPageParam: (lastPage: any) =>
            lastPage.pagination?.page < lastPage.pagination?.pages
                ? lastPage.pagination.page + 1
                : undefined,
        initialPageParam: 1,
    });

    const notifications =
        query.data?.pages.flatMap((page) => page.notifications) || [];
    const unreadCount = notifications.filter((notification: any) => !notification.isRead).length;

    return {
        notifications,
        unreadCount,
        isLoading: query.isLoading,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
    };
};

export const useMarkNotificationRead = () => {
    return useMutation({
        mutationFn: (notificationId: string) =>
            notificationApi.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.notifications.list(1)],
            });
        },
    });
};

export const useMarkAllRead = () => {
    return useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.notifications.list(1)],
            });
        },
    });
};

export const useDeleteNotification = () => {
    return useMutation({
        mutationFn: (notificationId: string) =>
            notificationApi.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKeys.notifications.list(1)],
            });
        },
    });
};
