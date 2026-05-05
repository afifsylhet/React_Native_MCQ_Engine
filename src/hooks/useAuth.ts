import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { userApi } from '../api/user.api';
import { saveTokens, clearTokens } from '../utils/storage';
import { queryClient } from '../api/queryClient';
import { initializePushNotifications } from '../services/pushNotificationService';
import { User } from '../types/api.types';
import {
    RegisterPayload,
    RegisterResponse,
    OtpPurpose,
    ResetPasswordPayload,
    ChangePasswordPayload,
} from '../types/auth.types';

const registerPushToken = async () => {
    try {
        const token = await initializePushNotifications();
        if (token) await userApi.savePushToken(token);
    } catch (error) {
        console.error('[useAuth] Push token registration failed:', error);
    }
};

export const useAuth = () => {
    const store = useAuthStore();

    const changePasswordMutation = useMutation({
        mutationFn: (vars: ChangePasswordPayload) => authApi.changePassword(vars),
    });

    const login = useCallback(
        async (email: string, password: string): Promise<User> => {
            const response = await authApi.login(email, password);
            await saveTokens(response.accessToken, response.refreshToken);
            store.setUser(response.user);
            registerPushToken();
            return response.user;
        },
        [store]
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('[useAuth] Logout error:', error);
        } finally {
            await clearTokens();
            store.logout();
            queryClient.clear();
        }
    }, [store]);

    // Register does NOT auto-login. Backend requires OTP verification first.
    const register = useCallback(
        async (payload: RegisterPayload): Promise<RegisterResponse> => {
            return authApi.register(payload);
        },
        []
    );

    const sendOtp = useCallback(
        (email: string, purpose: OtpPurpose = 'email_verification') =>
            authApi.sendOtp(email, purpose),
        []
    );

    // Verifies OTP. For email_verification this activates the account so the user
    // can then log in normally. For password_reset it unlocks the reset step.
    const verifyOtp = useCallback(
        (email: string, otp: string, purpose: OtpPurpose = 'email_verification') =>
            authApi.verifyOtp(email, otp, purpose),
        []
    );

    const resendOtp = useCallback(
        (email: string, purpose: OtpPurpose = 'email_verification') =>
            authApi.resendOtp(email, purpose),
        []
    );

    const forgotPassword = useCallback(
        (email: string) => authApi.forgotPassword(email),
        []
    );

    const resetPassword = useCallback(
        (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
        []
    );

    const changePassword = useCallback(
        (vars: ChangePasswordPayload) => changePasswordMutation.mutateAsync(vars),
        [changePasswordMutation]
    );

    const initializeAuth = useCallback(async () => {
        try {
            store.setLoading(true);

            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                store.logout();
                return;
            }

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('API request timeout')), 45000)
            );
            const user = (await Promise.race([
                authApi.getMe(),
                timeoutPromise,
            ])) as User;
            store.setUser(user);
            registerPushToken();
        } catch (error) {
            console.error('[useAuth] Initialization error:', error);
            await clearTokens();
            store.logout();
        } finally {
            store.setLoading(false);
        }
    }, [store]);

    return {
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        login,
        logout,
        register,
        sendOtp,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        isChangingPassword: changePasswordMutation.isPending,
        initializeAuth,
    };
};
