import apiClient from './client';
import {
    AuthResponse,
    RegisterPayload,
    RegisterResponse,
    OtpPurpose,
    ResetPasswordPayload,
    ChangePasswordPayload,
} from '../types/auth.types';
import { User } from '../types/api.types';

const unwrap = <T>(r: any): T => r.data.data;

export const authApi = {
    register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
        const res = await apiClient.post('/auth/register', payload);
        return unwrap<RegisterResponse>(res);
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const res = await apiClient.post('/auth/login', { email, password });
        return unwrap<AuthResponse>(res);
    },

    sendOtp: async (email: string, purpose: OtpPurpose): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/send-otp', { email, purpose });
        return unwrap<{ message: string }>(res);
    },

    verifyOtp: async (
        email: string,
        otp: string,
        purpose: OtpPurpose
    ): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/verify-otp', { email, otp, purpose });
        return unwrap<{ message: string }>(res);
    },

    resendOtp: async (email: string, purpose: OtpPurpose): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/resend-otp', { email, purpose });
        return unwrap<{ message: string }>(res);
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/forgot-password', { email });
        return unwrap<{ message: string }>(res);
    },

    resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/reset-password', payload);
        return unwrap<{ message: string }>(res);
    },

    changePassword: async (
        payload: ChangePasswordPayload
    ): Promise<{ message: string }> => {
        const res = await apiClient.patch('/auth/change-password', payload);
        return unwrap<{ message: string }>(res);
    },

    refreshToken: async (
        refreshToken: string
    ): Promise<{ accessToken: string; refreshToken?: string }> => {
        const res = await apiClient.post('/auth/refresh-token', { refreshToken });
        return unwrap<{ accessToken: string; refreshToken?: string }>(res);
    },

    getMe: async (): Promise<User> => {
        const res = await apiClient.get('/auth/me');
        return unwrap<User>(res);
    },

    logout: async (): Promise<{ message: string } | null> => {
        const res = await apiClient.post('/auth/logout');
        return res.data?.data ?? null;
    },
};
