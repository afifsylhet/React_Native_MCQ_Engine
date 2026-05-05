import apiClient from './client';

export interface NoticeAuthor {
    _id: string;
    fullName: string;
    email: string;
}

export interface Notice {
    _id: string;
    subject: string;
    message: string;
    isActive: boolean;
    targetModules?: Array<{
        examType: 'admission' | 'license';
        studentType: string;
    }>;
    createdBy: NoticeAuthor | string | null;
    updatedBy?: NoticeAuthor | string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NoticesResponse {
    items: Notice[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface CreateNoticePayload {
    subject: string;
    message: string;
    targetModules?: Array<{
        examType: 'admission' | 'license';
        studentType: string;
    }>;
}

export interface UpdateNoticePayload {
    subject?: string;
    message?: string;
    isActive?: boolean;
    targetModules?: Array<{
        examType: 'admission' | 'license';
        studentType: string;
    }>;
}

const formatApiError = (error: unknown): string => {
    const anyErr = error as any;
    const backendMsg =
        anyErr?.response?.data?.error?.message ||
        anyErr?.response?.data?.message;
    if (backendMsg) return backendMsg;
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
};

export const noticeApi = {
    listNotices: async (page = 1, limit = 10, activeOnly = true): Promise<NoticesResponse> => {
        try {
            const response = await apiClient.get<{ data: NoticesResponse }>('/notices', {
                params: { page, limit, activeOnly: activeOnly ? 'true' : 'false' },
            });
            return response.data.data;
        } catch (error) {
            throw new Error(formatApiError(error));
        }
    },

    getNotice: async (id: string): Promise<Notice> => {
        try {
            const response = await apiClient.get<{ data: Notice }>(`/notices/${id}`);
            return response.data.data;
        } catch (error) {
            throw new Error(formatApiError(error));
        }
    },

    createNotice: async (payload: CreateNoticePayload): Promise<Notice> => {
        try {
            const response = await apiClient.post<{ data: Notice }>('/notices', payload);
            return response.data.data;
        } catch (error) {
            throw new Error(formatApiError(error));
        }
    },

    updateNotice: async (id: string, payload: UpdateNoticePayload): Promise<Notice> => {
        try {
            const response = await apiClient.patch<{ data: Notice }>(`/notices/${id}`, payload);
            return response.data.data;
        } catch (error) {
            throw new Error(formatApiError(error));
        }
    },

    deleteNotice: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/notices/${id}`);
        } catch (error) {
            throw new Error(formatApiError(error));
        }
    },
};
