import apiClient from './client';
import { Question, Pagination } from '../types/api.types';
import { QuestionFilters } from '../types/question.types';

interface QuestionStatistics {
    totalQuestions: number;
    questionsByDifficulty: Record<string, number>;
    questionsByPattern: Record<string, number>;
}

interface QuestionsResponse {
    items: Question[];
    pagination: Pagination;
}

interface QuestionsResponseRaw {
    items?: Question[];
    questions?: Question[];
    pagination: Pagination;
}

interface ReportResponse {
    message: string;
    reported: boolean;
}

export interface SubjectChapterItem {
    subjectName: string;
    chapters: string[];
    questionCount: number;
}

/**
 * Formats API errors into readable error messages, preferring the backend's
 * message (from `error.response.data`) over Axios's generic status-code text.
 */
const formatApiError = (error: unknown): string => {
    const anyErr = error as any;
    const backendMsg =
        anyErr?.response?.data?.error?.message ||
        anyErr?.response?.data?.message;
    if (backendMsg) return backendMsg;
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
};

export const questionApi = {
    getQuestions: async (
        params: QuestionFilters
    ): Promise<QuestionsResponse> => {
        try {
            const response = await apiClient.get<{ data: QuestionsResponseRaw }>('/questions', { params });
            const data = response.data.data;
            return {
                items: data.items || data.questions || [],
                pagination: data.pagination,
            };
        } catch (error) {
            console.error('[questionApi] Get questions failed:', error);
            throw new Error(`Failed to fetch questions: ${formatApiError(error)}`);
        }
    },

    getQuestionById: async (id: string): Promise<Question> => {
        try {
            const response = await apiClient.get<{ data: Question }>(`/questions/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('[questionApi] Get question failed:', error);
            throw new Error(`Failed to fetch question: ${formatApiError(error)}`);
        }
    },

    getQuestionStatistics: async (): Promise<QuestionStatistics> => {
        try {
            const response = await apiClient.get<{ data: QuestionStatistics }>('/questions/statistics');
            return response.data.data;
        } catch (error) {
            console.error('[questionApi] Get statistics failed:', error);
            throw new Error(`Failed to fetch question statistics: ${formatApiError(error)}`);
        }
    },

    reportQuestion: async (
        questionId: string,
        reason: string,
        description: string
    ): Promise<ReportResponse> => {
        try {
            const response = await apiClient.post<{ data: ReportResponse }>(
                `/questions/${questionId}/report`,
                {
                    reason,
                    description,
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('[questionApi] Report question failed:', error);
            const status = (error as any)?.response?.status;
            const wrapped = new Error(formatApiError(error)) as Error & { status?: number };
            wrapped.status = status;
            throw wrapped;
        }
    },

    recordHintUsage: async (
        questionId: string
    ): Promise<{ usageCount: number; alreadyRecorded: boolean }> => {
        try {
            const response = await apiClient.post<{
                data: { usageCount: number; alreadyRecorded: boolean };
            }>(`/questions/${questionId}/hint-usage`);
            return response.data.data;
        } catch (error) {
            console.error('[questionApi] Record hint usage failed:', error);
            throw new Error(`Failed to record hint usage: ${formatApiError(error)}`);
        }
    },

    getAvailableYears: async (): Promise<number[]> => {
        try {
            console.log('[questionApi] Calling /questions/years endpoint');
            const response = await apiClient.get<{ data: { years: number[] } }>('/questions/years');
            console.log('[questionApi] Raw response:', response);
            console.log('[questionApi] Response data:', response.data);
            console.log('[questionApi] Response data.data:', response.data.data);
            const years = response.data.data.years;
            console.log('[questionApi] Extracted years:', years);
            return years;
        } catch (error) {
            console.error('[questionApi] Get available years failed:', error);
            console.error('[questionApi] Error details:',
                error instanceof Error ? { message: error.message, stack: error.stack } : error
            );
            throw new Error(`Failed to fetch available years: ${formatApiError(error)}`);
        }
    },

    getSubjectChapters: async (
        studentType: string,
        examType: string
    ): Promise<SubjectChapterItem[]> => {
        try {
            const response = await apiClient.get<{ data: { subjects: SubjectChapterItem[] } }>(
                '/questions/subjects-chapters',
                {
                    params: {
                        studentType,
                        examType,
                    },
                }
            );
            return response.data.data.subjects;
        } catch (error) {
            console.error('[questionApi] Get subject chapters failed:', error);
            throw new Error(`Failed to fetch subjects and chapters: ${formatApiError(error)}`);
        }
    },
};
