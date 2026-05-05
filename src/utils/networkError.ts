import { Alert } from 'react-native';
import axios, { AxiosError } from 'axios';

/**
 * Checks if an error is a network connectivity error
 */
export const isNetworkError = (error: any): boolean => {
    if (!error) return false;

    // Check for common network error indicators
    if (error.message === 'Network Error') return true;
    if (error.code === 'ECONNABORTED') return true; // Request timeout
    if (error.code === 'ENOTFOUND') return true; // DNS resolution failed
    if (error.code === 'ECONNREFUSED') return true; // Connection refused
    if (error.code === 'ETIMEDOUT') return true; // Connection timeout
    if (error.code === 'ERR_NETWORK') return true; // Network error

    // Check for no internet response status
    if (error.response?.status === 0) return true;

    // Check message for network indicators
    const message = error.message?.toLowerCase() || '';
    if (
        message.includes('network') ||
        message.includes('failed to fetch') ||
        message.includes('network request failed') ||
        message.includes('timeout')
    ) {
        return true;
    }

    return false;
};

/**
 * Shows a network error alert to the user
 */
export const showNetworkErrorAlert = () => {
    Alert.alert(
        '🌐 ইন্টারনেট সংযোগ নেই',
        'দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।',
        [{ text: 'ঠিক আছে', onPress: () => { } }],
        { cancelable: false }
    );
};

/**
 * Shows a generic API error alert
 */
export const showApiErrorAlert = (error: AxiosError<any> | any, defaultMessage?: string) => {
    let title = '❌ ত্রুটি';
    let message = defaultMessage || 'কিছু সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।';

    // If it's a network error, show network error alert instead
    if (isNetworkError(error)) {
        showNetworkErrorAlert();
        return;
    }

    // Try to extract API error message
    if (error.response?.data?.message) {
        message = error.response.data.message;
    } else if (error.response?.data?.error) {
        message = error.response.data.error;
    } else if (error.message) {
        message = error.message;
    }

    // Add status code context if available
    if (error.response?.status) {
        if (error.response.status === 401) {
            title = '🔒 অননুমোদিত';
            message = 'আপনার সেশন শেষ হয়েছে, অনুগ্রহ করে আবার লগইন করুন।';
        } else if (error.response.status === 403) {
            title = '🚫 অনুমতি নেই';
            message = 'আপনার এই অ্যাকশন করার অনুমতি নেই।';
        } else if (error.response.status === 404) {
            title = '🔍 খুঁজে পাওয়া যায়নি';
            message = 'অনুসন্ধান করা আইটেমটি বিদ্যমান নেই।';
        } else if (error.response.status === 422) {
            title = '⚠️ তথ্য যাচাইকরণ ব্যর্থ';
            // message already set from API response
        } else if (error.response.status === 500 || error.response.status >= 500) {
            title = '⚙️ সার্ভার ত্রুটি';
            message = 'সার্ভার এ সমস্যা হয়েছে, অনুগ্রহ করে পরে চেষ্টা করুন।';
        }
    }

    Alert.alert(title, message, [{ text: 'ঠিক আছে', onPress: () => { } }], { cancelable: false });
};

/**
 * Handles axios errors globally with appropriate alerts
 */
export const handleAxiosError = (error: any) => {
    console.error('[API Error]', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
    });

    if (isNetworkError(error)) {
        showNetworkErrorAlert();
    } else {
        showApiErrorAlert(error);
    }

    return Promise.reject(error);
};
