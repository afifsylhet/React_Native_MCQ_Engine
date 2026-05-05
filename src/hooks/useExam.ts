import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query';
import { examApi } from '../api/exam.api';
import { queryClient, queryKeys } from '../api/queryClient';
import { ExamHistoryFilters } from '../types/exam.types';
import { GenerateExamPayload } from '../types/exam.types';

export const useExamHistory = (filters?: ExamHistoryFilters) => {
    return useInfiniteQuery({
        queryKey: queryKeys.exam.history(filters?.page || 1, filters?.examCategory),
        queryFn: ({ pageParam = 1 }) =>
            examApi.getExamHistory({ ...filters, page: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.pages
                ? lastPage.page + 1
                : undefined,
        initialPageParam: 1,
    });
};

export const useExamResult = (attemptId: string | null) => {
    return useQuery({
        queryKey: queryKeys.exam.result(attemptId || ''),
        queryFn: () => examApi.getExamResult(attemptId!),
        enabled: !!attemptId,
    });
};

export const useSubmitExam = () => {
    return useMutation({
        mutationFn: ({
            attemptId,
            answers,
            totalTimeTakenSeconds,
        }: {
            attemptId: string;
            answers: any[];
            totalTimeTakenSeconds: number;
        }) => examApi.submitExam(attemptId, answers, totalTimeTakenSeconds),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.exam.history(1),
            });
            // Backend /submit returns a partial summary (no correct/wrong/unanswered
            // counts). Invalidate the result cache so the ExamResult screen refetches
            // the full payload from /exams/:id/result instead of reading this partial.
            queryClient.invalidateQueries({
                queryKey: queryKeys.exam.result(variables.attemptId),
            });
        },
    });
};

/**
 * Hook to generate a new exam attempt
 * Calls the backend to create an exam with generated questions
 */
export const useGenerateExam = () => {
    return useMutation({
        mutationFn: (payload: GenerateExamPayload) => examApi.generateExam(payload),
        onSuccess: (data) => {
            // Cache the exam attempt details
            queryClient.setQueryData(
                queryKeys.exam.attempt(data.attemptId),
                data
            );
        },
    });
};

/**
 * Hook to fetch exam attempt details (questions, etc.)
 * Used when resuming or viewing an exam that's already been started
 */
export const useExamAttempt = (attemptId: string | null) => {
    return useQuery({
        queryKey: queryKeys.exam.attempt(attemptId || ''),
        queryFn: () => examApi.getExamAttemptDetail(attemptId!),
        enabled: !!attemptId,
    });
};

/**
 * Main hook for exam operations
 * Provides generateExam function and loading state
 */
export const useExam = () => {
    const mutation = useGenerateExam();

    return {
        generateExam: mutation.mutateAsync,
        isGeneratingExam: mutation.isPending,
        error: mutation.error,
    };
};

/**
 * Hook to fetch the user's exam quota status (free tier only).
 * Subscribed users get unlimited = true.
 */
export const useQuotaStatus = () => {
    return useQuery({
        queryKey: queryKeys.exam.quota,
        queryFn: () => examApi.getQuotaStatus(),
        staleTime: 60 * 1000,
    });
};
