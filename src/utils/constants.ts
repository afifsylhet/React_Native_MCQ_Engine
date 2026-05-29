import { StudentType } from '../types/api.types';

export const STUDENT_TYPES: Array<{ value: StudentType; label: string }> = [
    { value: 'diploma_nursing_midwifery', label: 'Diploma in Nursing Science and Midwifery' },
    { value: 'diploma_midwifery', label: 'Diploma in Midwifery' },
    { value: 'bsc_nursing', label: 'B.Sc. in Nursing' },
    { value: 'post_basic_bsc_nursing', label: 'Post Basic B.Sc. in Nursing' },
    { value: 'post_basic_bsc_midwifery', label: 'Post Basic B.Sc. in Midwifery' },
];

export const EXAM_CATEGORIES = [
    { value: 'past_exam', label: 'Past Exam Questions' },
    { value: 'model_test', label: 'Model Tests' },
    { value: 'subject', label: 'Subject Practice' },
    { value: 'chapter', label: 'Chapter Practice' },
];

export const EXAM_TYPES = ['license', 'admission'] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'] as const;

export const QUESTION_PATTERNS = ['mcq', 'true_false', 'mixed'] as const;

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export const DEFAULT_QUESTION_COUNTS = {
    past_exam: 100,
    model_test: 100,
    subject: 30,
    chapter: 20,
} as const;

export const DEFAULT_TIME_LIMITS = {
    past_exam: 5400, // 90 minutes
    model_test: 5400, // 90 minutes
    subject: 1800, // 30 minutes
    chapter: 1200, // 20 minutes
} as const;

export const RATE_LIMIT_MESSAGES = {
    auth: 'Too many attempts. Please wait 15 minutes.',
    otp: 'OTP limit reached. Please wait 1 hour.',
    exam: 'Too many exams generated. Please wait before trying again.',
};

export const MIN_PASSWORD_LENGTH = 8;
export const OTP_LENGTH = 6;
export const OTP_RESEND_COOLDOWN = 60; // seconds

export const NOTIFICATION_TYPES = {
    exam: 'exam',
    subscription: 'subscription',
    system: 'system',
    performance: 'performance',
    achievement: 'achievement',
} as const;

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
    exam: '#0F7B6C',
    subscription: '#F59E0B',
    system: '#3B82F6',
    performance: '#10B981',
    achievement: '#8B5CF6',
};
