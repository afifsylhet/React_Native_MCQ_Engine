// API Response Envelope Types
export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
    error?: {
        message: string;
        code: string;
        details: Record<string, string>;
    };
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    message: string | null;
}

// User Types — match backend user.model.js
export interface User {
    _id?: string;
    id?: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: 'student' | 'instructor' | 'admin';
    studentType: StudentType;
    examType: ExamType;
    profilePicture?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    weeklyScore?: number;
    totalScore?: number;
    createdAt?: string;
    updatedAt?: string;
    activeSubscription?: {
        _id: string;
        plan: 'quarterly' | 'half_yearly';
        price: number;
        currency: string;
        startDate: string;
        endDate: string;
        status: 'approved';
    } | null;
}

export type StudentType =
    | 'diploma_midwifery'
    | 'diploma_nursing_midwifery'
    | 'bsc_nursing'
    | 'post_basic_midwifery'
    | 'bsc_midwifery';

export type ExamType = 'admission' | 'license';

// Question Types
export interface Question {
    _id: string; // MongoDB ID from backend
    variantIndex?: number; // Index of the variant being used
    question?: string; // The actual question text
    text?: string; // Alternative text property
    questionPattern: 'mcq' | 'true_false';
    difficulty?: 'easy' | 'medium' | 'hard';
    studentType?: StudentType;
    examType?: string;
    subjectName?: string;
    chapterName?: string;
    year?: number;
    options?: QuestionOption[];
    statements?: QuestionStatement[];
    totalMarkOfTheQuestion?: number;
    hints?: string[];
    correctAnswer?: number | number[];
    explanation?: string;
    createdAt?: string;
}

export interface QuestionOption {
    text: string;
    orderIndex: number;
}

export interface QuestionStatement {
    text: string;
    orderIndex: number;
}

// Exam Types
export interface ExamAttempt {
    attemptId: string;
    questions: Question[];
    timeLimitSeconds: number;
    startedAt: string;
}

export interface ExamResult {
    attemptId: string;
    examCategory?: string;
    examType?: string;
    totalQuestions: number;
    totalMarks: number;
    obtainedMarks: number;
    percentageScore: number;
    isPassed: boolean;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
    answers: AnswerWithResult[];
    timeTakenSeconds?: number;
    startedAt?: string;
    submittedAt?: string;
}

export interface ReviewOption {
    text: string;
    isCorrect: boolean;
}

export interface ReviewStatement {
    text: string;
    isTrue: boolean;
    selectedValue?: boolean;
    isCorrect?: boolean;
}

export interface AnswerWithResult {
    questionId: string;
    questionText: string;
    questionPattern: 'mcq' | 'true_false';
    // MCQ
    options?: ReviewOption[];
    selectedOptionIndex?: number;
    correctOptionIndex?: number;
    // True/False
    statements?: ReviewStatement[];
    statementAnswers?: { statementIndex: number; selectedValue: boolean; isCorrect?: boolean }[];
    // Scoring
    isCorrect: boolean;
    earnedMarks: number;
    totalMarks: number;
    explanation?: string;
    hints?: string[];
}

export interface MCQAnswer {
    questionId: string;
    selectedOptionIndex: number;
}

export interface TrueFalseAnswer {
    questionId: string;
    statementAnswers: { statementIndex: number; selectedValue: boolean }[];
}

export type ExamAnswer = MCQAnswer | TrueFalseAnswer;

// Subscription Types
export interface SubscriptionPlan {
    planId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    durationDays: number;
    benefits: string[];
    isActive: boolean;
}

export interface Subscription {
    subscriptionId: string;
    planId: string;
    planName: string;
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string;
    daysRemaining: number;
    amount: number;
    currency: string;
    autoRenew: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    email: string;
    profilePicture?: string;
    score: number;
    examsTaken: number;
    accuracy: number;
    studentType: StudentType;
    examType?: ExamType;
}

export interface MyRank {
    userId: string;
    userName: string;
    rank: number;
    weeklyScore: number;
    totalScore: number;
    examsTaken: number;
    accuracy: number;
    percentile: number;
    studentType: StudentType;
    examType?: ExamType;
    comparedTo: number;
    scoreGainThisWeek: number;
}

// Notification Types
export interface Notification {
    notificationId?: string;
    _id?: string;
    type: 'exam' | 'subscription' | 'system' | 'performance' | 'achievement';
    title: string;
    message?: string;
    body?: string;
    icon?: string;
    isRead: boolean;
    actionUrl?: string;
    createdAt: string;
}

// Statistics Types
export interface UserStatistics {
    totalExamsTaken: number;
    totalScore: number;
    weeklyScore: number;
    averageScore: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
    accuracyPercentage: number;
    examsPassed: number;
    examsFailed: number;
    passPercentage: number;
    bestScore: number;
    worstScore: number;
    streakDays?: number;
}

// Exam History Types
export interface ExamHistoryItem {
    attemptId: string;
    examCategory: string;
    questionCount: number;
    percentageScore: number;
    obtainedMarks: number;
    totalMarks: number;
    isPassed: boolean;
    timeTakenSeconds: number;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}
