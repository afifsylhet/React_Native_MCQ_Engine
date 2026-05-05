import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const normalizeMessage = (message: string): string =>
    message.trim().toLowerCase().replace(/\s+/g, ' ');

export const formatAuthValidationErrorBn = (message: string): string => {
    const normalized = normalizeMessage(message);

    if (
        normalized.includes('email and phone number are already registered') ||
        normalized.includes('both email and phone number are already registered')
    ) {
        return 'এই ইমেইল ও ফোন নম্বর দিয়ে ইতোমধ্যে অ্যাকাউন্ট আছে।';
    }

    if (
        normalized.includes('email already registered') ||
        normalized.includes('user already exists with this email') ||
        normalized.includes('user available in this email') ||
        normalized.includes('user exists in this email') ||
        normalized.includes('duplicate email')
    ) {
        return 'এই ইমেইল দিয়ে ইতোমধ্যে একজন ইউজার আছে।';
    }

    if (
        normalized.includes('phone number already registered') ||
        normalized.includes('user already exists with this phone') ||
        normalized.includes('user already exists with this phone number') ||
        normalized.includes('user available in this phone') ||
        normalized.includes('user exists in this phone') ||
        normalized.includes('duplicate phone')
    ) {
        return 'এই ফোন নম্বর দিয়ে ইতোমধ্যে একজন ইউজার আছে।';
    }

    if (normalized.includes('e11000') && normalized.includes('email')) {
        return 'এই ইমেইল দিয়ে ইতোমধ্যে একজন ইউজার আছে।';
    }

    if (normalized.includes('e11000') && normalized.includes('phone')) {
        return 'এই ফোন নম্বর দিয়ে ইতোমধ্যে একজন ইউজার আছে।';
    }

    if (normalized.includes('phone number must be exactly 11 digits')) {
        return 'ফোন নম্বর অবশ্যই ১১ সংখ্যার হতে হবে এবং শুধুমাত্র সংখ্যা ব্যবহার করতে হবে।';
    }

    if (normalized.includes('passwords do not match')) {
        return 'পাসওয়ার্ড মিলছে না।';
    }

    if (
        normalized.includes('password must contain at least one uppercase letter') ||
        normalized.includes('password must be at least 8 characters long')
    ) {
        return 'পাসওয়ার্ডে কমপক্ষে ৮টি অক্ষর, একটি বড় হাতের, একটি ছোট হাতের এবং একটি সংখ্যা থাকতে হবে।';
    }

    if (normalized.includes('invalid credentials')) {
        return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
    }

    if (normalized.includes('please verify your email first')) {
        return 'লগইন করার আগে অনুগ্রহ করে আপনার ইমেইল যাচাই করুন।';
    }

    if (normalized.includes('your account has been deactivated')) {
        return 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। সহায়তার জন্য সাপোর্টে যোগাযোগ করুন।';
    }

    if (normalized.includes('account locked. try again after')) {
        return 'অতিরিক্ত ভুল চেষ্টার কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে লক হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
    }

    if (normalized.includes('invalid or expired otp')) {
        return 'ওটিপি ভুল অথবা মেয়াদোত্তীর্ণ হয়েছে। নতুন ওটিপি নিয়ে আবার চেষ্টা করুন।';
    }

    if (normalized.includes('invalid otp')) {
        return 'ওটিপি সঠিক নয়। আবার চেষ্টা করুন।';
    }

    if (normalized.includes('max otp resend limit reached')) {
        return 'ওটিপি পুনরায় পাঠানোর সীমা অতিক্রম হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
    }

    if (normalized.includes('seconds before requesting another otp')) {
        return 'নতুন ওটিপি চাওয়ার আগে অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।';
    }

    if (normalized.includes('user not found')) {
        return 'এই তথ্য দিয়ে কোনো ইউজার পাওয়া যায়নি।';
    }

    if (normalized.includes('token expired')) {
        return 'সেশন মেয়াদ শেষ হয়েছে। আবার লগইন করুন।';
    }

    if (normalized.includes('invalid token')) {
        return 'টোকেন অবৈধ। আবার লগইন করুন।';
    }

    if (normalized.includes('session expired')) {
        return 'সেশন শেষ হয়ে গেছে। আবার লগইন করুন।';
    }

    if (normalized.includes('invalid refresh token')) {
        return 'সেশন মেয়াদ শেষ হয়েছে। আবার লগইন করুন।';
    }

    return message;
};

export const formatApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const backendMessage =
            error.response?.data?.error?.message || error.response?.data?.message;

        if (backendMessage) {
            return formatAuthValidationErrorBn(backendMessage);
        }

        if (error.response?.data?.error?.message) {
            return error.response.data.error.message;
        }
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.response?.status === 0 || error.message === 'Network Error') {
            return 'ইন্টারনেট সংযোগ নেই। আপনার নেটওয়ার্ক যাচাই করুন।';
        }
        if (error.code === 'ECONNABORTED') {
            return 'অনুরোধের সময় শেষ। আবার চেষ্টা করুন।';
        }
    }
    return 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।';
};

export const formatDate = (dateString: string): string => {
    try {
        return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
        return dateString;
    }
};

export const formatRelativeDate = (dateString: string): string => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
        return dateString;
    }
};

export const formatRelativeTime = formatRelativeDate;

export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(
            2,
            '0'
        )}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Alias for backward compatibility
export const formatTime = formatDuration;

export const formatScore = (obtained: number, total: number): string => {
    return `${obtained} / ${total}`;
};

export const formatPercentage = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
        return '0%';
    }
    return `${value.toFixed(1)}%`;
};

export const maskName = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
        return fullName;
    }
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
};

export const getStudentTypeLabel = (studentType: string): string => {
    const labels: Record<string, string> = {
        diploma_midwifery: 'ডিপ্লোমা ইন মিডওয়াইফারি',
        diploma_nursing_midwifery: 'ডিপ্লোমা ইন নার্সিং ও মিডওয়াইফারি',
        bsc_midwifery: 'বিএসসি ইন মিডওয়াইফারি',
        post_basic_midwifery: 'পোস্ট বেসিক মিডওয়াইফারি',
        bsc_nursing_midwifery: 'বিএসসি ইন নার্সিং ও মিডওয়াইফারি',
    };
    return labels[studentType] || studentType;
};

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'শুভ সকাল';
    if (hour < 18) return 'শুভ দুপুর';
    return 'শুভ সন্ধ্যা';
};

export const initials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
