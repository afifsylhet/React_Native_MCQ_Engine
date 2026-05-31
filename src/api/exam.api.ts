import apiClient from './client';
import axios from 'axios';
import {
    ExamAttempt,
    ExamResult,
    ExamHistoryItem,
    Pagination,
} from '../types/api.types';
import { GenerateExamPayload, SubmitExamPayload, ExamHistoryFilters } from '../types/exam.types';

interface ExamHistoryResponse {
    items: ExamHistoryItem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

/** Shape actually returned by the backend */
interface BackendExamHistoryResponse {
    attempts: Array<{
        _id: string;
        examCategory: string;
        totalQuestions: number;
        percentageScore: number;
        obtainedMarks: number;
        totalMarks: number;
        isPassed: boolean;
        timeTakenSeconds?: number;
        createdAt: string;
        updatedAt: string;
        [key: string]: any;
    }>;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

interface ExamAnswer {
    questionId: string;
    selectedOptionIndex: number;
}

export interface QuotaStatus {
    hasActiveSubscription: boolean;
    limitType: 'weekly' | 'lifetime';
    limit: number | null;
    used: number;
    remaining: number | null;
    weekStartDate?: string | null;
    canStart?: {
        25: boolean;
        50: boolean;
        100: boolean;
    };
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

export const examApi = {
    generateExam: async (payload: GenerateExamPayload): Promise<ExamAttempt> => {
        try {
            const response = await apiClient.post<{ data: ExamAttempt }>('/exams/generate', payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status !== 422) {
                console.error('[examApi] Generate exam failed:', error);
            }
            // Preserve original error (including axios response) so callers can
            // inspect status codes (e.g., 402 for subscription required).
            throw error;
        }
    },

    submitExam: async (
        attemptId: string,
        answers: ExamAnswer[],
        totalTimeTakenSeconds: number
    ): Promise<Omit<ExamResult, 'answers'>> => {
        try {
            const response = await apiClient.post<{ data: Omit<ExamResult, 'answers'> }>(
                `/exams/${attemptId}/submit`,
                {
                    answers,
                    totalTimeTakenSeconds,
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('[examApi] Submit exam failed:', error);
            throw new Error(`Failed to submit exam: ${formatApiError(error)}`);
        }
    },

    getExamResult: async (attemptId: string): Promise<ExamResult> => {
        try {
            const response = await apiClient.get<{ data: ExamResult }>(`/exams/${attemptId}/result`);
            return response.data.data;
        } catch (error) {
            console.error('[examApi] Get exam result failed:', error);
            throw new Error(`Failed to fetch exam result: ${formatApiError(error)}`);
        }
    },

    getExamHistory: async (
        params: ExamHistoryFilters
    ): Promise<ExamHistoryResponse> => {
        try {
            const response = await apiClient.get<{ data: BackendExamHistoryResponse }>('/exams/history', { params });
            const raw = response.data.data;

            // Remap backend shape to frontend ExamHistoryResponse
            return {
                items: (raw.attempts ?? []).map((a) => ({
                    attemptId: a._id,
                    examCategory: a.examCategory,
                    questionCount: a.totalQuestions,
                    percentageScore: a.percentageScore,
                    obtainedMarks: a.obtainedMarks,
                    totalMarks: a.totalMarks,
                    isPassed: a.isPassed,
                    timeTakenSeconds: a.timeTakenSeconds ?? 0,
                    createdAt: a.createdAt,
                    updatedAt: a.updatedAt,
                })),
                total: raw.pagination.total,
                page: raw.pagination.page,
                limit: raw.pagination.limit,
                pages: raw.pagination.pages,
            };
        } catch (error) {
            console.error('[examApi] Get exam history failed:', error);
            throw new Error(`Failed to fetch exam history: ${formatApiError(error)}`);
        }
    },

    getExamAttemptDetail: async (attemptId: string): Promise<ExamResult> => {
        try {
            const response = await apiClient.get<{ data: ExamResult }>(`/exams/history/${attemptId}`);
            return response.data.data;
        } catch (error) {
            console.error('[examApi] Get exam attempt detail failed:', error);
            throw new Error(`Failed to fetch exam details: ${formatApiError(error)}`);
        }
    },

    getQuotaStatus: async (): Promise<QuotaStatus> => {
        try {
            const response = await apiClient.get<{ data: QuotaStatus }>('/exams/quota');
            return response.data.data;
        } catch (error) {
            console.error('[examApi] Get quota status failed:', error);
            throw new Error(`Failed to fetch quota status: ${formatApiError(error)}`);
        }
    },
};
