import { create } from 'zustand';
import { User } from '../types/api.types';

interface AuthStoreState {
    user: User | null;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
    setUser: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setEmailVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
    user: null,
    isAuthenticated: false,
    isEmailVerified: false,
    isLoading: true,

    setUser: (user: User) => {
        set({
            user,
            isAuthenticated: true,
            isEmailVerified: user.isEmailVerified,
        });
    },

    logout: () => {
        set({
            user: null,
            isAuthenticated: false,
            isEmailVerified: false,
        });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    setEmailVerified: (verified: boolean) => {
        set({ isEmailVerified: verified });
    },
}));
