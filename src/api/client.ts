import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { isNetworkError, showNetworkErrorAlert } from '../utils/networkError';

// Resolve API base URL with sane defaults for every runtime:
// 1. EXPO_PUBLIC_API_URL (if set in .env)
// 2. Physical device via Expo Go → host machine IP from Expo host URI
// 3. Android emulator → 10.0.2.2
// 4. iOS simulator / web / desktop → localhost
const resolveBaseURL = (): string => {
    // @ts-ignore — Expo env vars are injected at build time
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    const port = 5000;
    const path = '/api/v1';

    // Expo Go / dev client exposes the host URI, which gives us the LAN IP of the dev machine
    const hostUri =
        (Constants.expoConfig as any)?.hostUri ||
        (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
        (Constants as any)?.manifest?.debuggerHost;

    if (hostUri && typeof hostUri === 'string') {
        const host = hostUri.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
            return `http://${host}:${port}${path}`;
        }
    }

    if (Platform.OS === 'android') {
        return `http://10.0.2.2:${port}${path}`;
    }

    return `http://localhost:${port}${path}`;
};

const baseURL = resolveBaseURL();

if (__DEV__) {
    console.log('[API] Base URL →', baseURL);
}

const apiClient: AxiosInstance = axios.create({
    baseURL,
    timeout: 45000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosRetry(apiClient, {
    retries: 3,
    retryDelay: (retryCount) => Math.pow(2, retryCount) * 200,
    retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response?.status === 504,
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            // Log API requests for debugging
            if (__DEV__) {
                console.log(
                    `[API] ${config.method?.toUpperCase()} ${config.url}`,
                    config.data ? `Data: ${JSON.stringify(config.data).substring(0, 100)}` : ''
                );
            }
        } catch (error) {
            console.error('[API] Error reading access token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Token refresh with a single-flight queue
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (value: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token!);
    });
    failedQueue = [];
};

// Called when refresh ultimately fails — let the store reset auth state
let onAuthFailure: (() => void) | null = null;
export const setAuthFailureHandler = (handler: () => void) => {
    onAuthFailure = handler;
};

apiClient.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`[API] Response: ${response.status} from ${response.config.url}`);
        }
        return response;
    },
    async (error) => {
        // Log API errors for debugging
        console.error(
            '[API Error]',
            error.config?.url,
            'Status:',
            error.response?.status,
            'Message:',
            error.message
        );

        // Handle network errors first - show alert and reject
        if (isNetworkError(error)) {
            showNetworkErrorAlert();
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        // Don't try to refresh on auth endpoints (login/register/refresh themselves)
        const url: string = originalRequest?.url || '';
        const isAuthEndpoint =
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh-token') ||
            url.includes('/auth/verify-otp');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');

                const response = await axios.post(`${baseURL}/auth/refresh-token`, {
                    refreshToken,
                });

                const payload = response.data?.data || {};
                const newAccessToken: string = payload.accessToken;
                const newRefreshToken: string = payload.refreshToken || refreshToken;

                if (!newAccessToken) throw new Error('Refresh response missing accessToken');

                await SecureStore.setItemAsync('accessToken', newAccessToken);
                if (payload.refreshToken) {
                    await SecureStore.setItemAsync('refreshToken', newRefreshToken);
                }

                apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                try {
                    await SecureStore.deleteItemAsync('accessToken');
                    await SecureStore.deleteItemAsync('refreshToken');
                } catch (e) {
                    console.error('[API] Error clearing tokens:', e);
                }

                processQueue(refreshError, null);
                isRefreshing = false;
                onAuthFailure?.();

                // Show auth failure alert
                if (!isNetworkError(refreshError)) {
                    Alert.alert(
                        '🔒 সেশন শেষ',
                        'আপনার সেশন শেষ হয়েছে, অনুগ্রহ করে আবার লগইন করুন।',
                        [{ text: 'ঠিক আছে', onPress: () => { } }],
                        { cancelable: false }
                    );
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
export { apiClient, baseURL };
