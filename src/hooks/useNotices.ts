import { useMutation, useQuery } from '@tanstack/react-query';
import { noticeApi, CreateNoticePayload, UpdateNoticePayload } from '../api/notice.api';
import { queryClient, queryKeys } from '../api/queryClient';

export const useNotices = (page = 1, activeOnly = true) => {
    return useQuery({
        queryKey: queryKeys.notice.list(page, activeOnly),
        queryFn: () => noticeApi.listNotices(page, 10, activeOnly),
        staleTime: 60 * 1000,
    });
};

export const useNotice = (id: string | null) => {
    return useQuery({
        queryKey: queryKeys.notice.detail(id || ''),
        queryFn: () => noticeApi.getNotice(id!),
        enabled: !!id,
    });
};

const invalidateNoticeLists = () => {
    queryClient.invalidateQueries({ queryKey: ['notice', 'list'] });
};

export const useCreateNotice = () => {
    return useMutation({
        mutationFn: (payload: CreateNoticePayload) => noticeApi.createNotice(payload),
        onSuccess: invalidateNoticeLists,
    });
};

export const useUpdateNotice = () => {
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateNoticePayload }) =>
            noticeApi.updateNotice(id, payload),
        onSuccess: (_, { id }) => {
            invalidateNoticeLists();
            queryClient.invalidateQueries({ queryKey: queryKeys.notice.detail(id) });
        },
    });
};

export const useDeleteNotice = () => {
    return useMutation({
        mutationFn: (id: string) => noticeApi.deleteNotice(id),
        onSuccess: invalidateNoticeLists,
    });
};
