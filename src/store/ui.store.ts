import { create } from 'zustand';

interface UIStoreState {
    theme: 'light' | 'dark';
    locale: 'en' | 'bn';
    setTheme: (theme: 'light' | 'dark') => void;
    setLocale: (locale: 'en' | 'bn') => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
    theme: 'light',
    locale: 'en',

    setTheme: (theme) => {
        set({ theme });
    },

    setLocale: (locale) => {
        set({ locale });
    },
}));
