import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token management using SecureStore (hardware-backed security)

export const saveTokens = async (
    accessToken: string,
    refreshToken: string
): Promise<void> => {
    try {
        await Promise.all([
            SecureStore.setItemAsync('accessToken', accessToken),
            SecureStore.setItemAsync('refreshToken', refreshToken),
        ]);
    } catch (error) {
        console.error('[Storage] Error saving tokens:', error);
        throw error;
    }
};

export const getAccessToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync('accessToken');
    } catch (error) {
        console.error('[Storage] Error reading access token:', error);
        return null;
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync('refreshToken');
    } catch (error) {
        console.error('[Storage] Error reading refresh token:', error);
        return null;
    }
};

export const clearTokens = async (): Promise<void> => {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync('accessToken'),
            SecureStore.deleteItemAsync('refreshToken'),
        ]);
    } catch (error) {
        console.error('[Storage] Error clearing tokens:', error);
    }
};

// User preferences using AsyncStorage

export const saveUserPrefs = async (
    prefs: Record<string, unknown>
): Promise<void> => {
    try {
        await AsyncStorage.setItem('userPrefs', JSON.stringify(prefs));
    } catch (error) {
        console.error('[Storage] Error saving user preferences:', error);
    }
};

export const getUserPrefs = async (): Promise<Record<
    string,
    unknown
> | null> => {
    try {
        const prefs = await AsyncStorage.getItem('userPrefs');
        return prefs ? JSON.parse(prefs) : null;
    } catch (error) {
        console.error('[Storage] Error reading user preferences:', error);
        return null;
    }
};

// Exam draft persistence for crash recovery

export const saveExamDraft = async (
    attemptId: string,
    draft: unknown
): Promise<void> => {
    try {
        await AsyncStorage.setItem(`exam_draft_${attemptId}`, JSON.stringify(draft));
    } catch (error) {
        console.error('[Storage] Error saving exam draft:', error);
    }
};

export const getExamDraft = async (attemptId: string): Promise<unknown | null> => {
    try {
        const draft = await AsyncStorage.getItem(`exam_draft_${attemptId}`);
        return draft ? JSON.parse(draft) : null;
    } catch (error) {
        console.error('[Storage] Error reading exam draft:', error);
        return null;
    }
};

export const clearExamDraft = async (attemptId: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(`exam_draft_${attemptId}`);
    } catch (error) {
        console.error('[Storage] Error clearing exam draft:', error);
    }
};
