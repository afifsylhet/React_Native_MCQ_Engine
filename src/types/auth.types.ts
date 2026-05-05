import { User, StudentType, ExamType } from './api.types';

export type OtpPurpose = 'email_verification' | 'password_reset';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phoneNumber: string;
    studentType: StudentType;
    examType: ExamType;
}

export interface RegisterResponse {
    userId: string;
    email: string;
    message: string;
}

export interface OtpPayload {
    email: string;
    otp: string;
    purpose: OtpPurpose;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}
