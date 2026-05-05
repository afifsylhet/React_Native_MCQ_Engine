import {
    NavigatorScreenParams,
    CompositeScreenProps,
} from '@react-navigation/native';
import {
    NativeStackScreenProps,
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
    BottomTabScreenProps,
    BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';

// Auth Stack Parameters
export type AuthStackParamList = {
    Main: undefined;
    Splash: undefined;
    Onboarding: undefined;
    Login: undefined;
    Register: undefined;
    OTPVerification: { email: string; purpose?: 'email_verification' | 'password_reset' };
    ForgotPassword: undefined;
    ResetPassword: { email: string; otp: string };
};

// Home Stack Parameters
export type HomeStackParamList = {
    HomeMain: undefined;
    Notifications: undefined;
    NotificationDetail: {
        notificationId: string;
        notificationType:
        | 'exam_result'
        | 'achievement'
        | 'reminder'
        | 'leaderboard'
        | 'promo'
        | 'exam'
        | 'subscription'
        | 'system'
        | 'performance'
        | 'notice';
        notificationTitle?: string;
        notificationMessage?: string;
        notificationCreatedAt?: string;
        notificationIsRead?: boolean;
    };
};

// Exam Stack Parameters
export type ExamStackParamList = {
    ExamHub: undefined;
    PastExam: { studentType: string; examType?: string };
    ModelTest: { studentType: string };
    Practice: { studentType: string };
    ExamConfig: {
        examCategory: string;
        studentType: string;
        subjectName?: string;
        chapterNames?: string[];
        examType?: string;
        year?: number;
    };
    ExamSession: { attemptId: string; examCategory?: string };
    ExamResult: { attemptId: string };
    ExamReview: { attemptId: string };
    SubscriptionRequired: {
        reason?: 'category_locked' | 'quota_exceeded';
        message?: string;
    };
    ModuleUnavailable: {
        moduleLabel?: string;
        message?: string;
    };
    ModuleMaintenance: {
        moduleName?: string;
        examType?: string;
        studentType?: string;
    };
};

// Profile Stack Parameters
export type ProfileStackParamList = {
    MyProfile: undefined;
    EditProfile: undefined;
    History: undefined;
    HistoryDetail: {
        examId: string;
        examTitle: string;
        score: number;
        totalQuestions: number;
        date: string;
    };
    ChangePassword: undefined;
    Subscription: undefined;
    Plans: undefined;
    NotificationSettings: undefined;
    ModuleUnavailable: {
        moduleLabel?: string;
        message?: string;
    };
    ModuleMaintenance: {
        moduleName?: string;
        examType?: string;
        studentType?: string;
    };
};

// Settings Stack Parameters
export type SettingsStackParamList = {
    Settings: undefined;
    NotificationSettings: undefined;
    AccountSettings: undefined;
    PrivacySettings: undefined;
};

// Admin Stack Parameters
export type AdminStackParamList = {
    AdminDashboard: undefined;
    UserManagement: undefined;
    UserDetail: { userId: string; email: string };
    QuestionManagement: undefined;
    CreateQuestion: undefined;
    QuestionDetail: { questionId: string };
    EditQuestion: { questionId: string };
    ReportManagement: undefined;
    ReportDetail: { questionId: string; reportCount: number };
    SubscriptionManagement: undefined;
    PreparationModuleManagement: undefined;
    NoticeManagement: undefined;
    CreateNotice: undefined;
};

// App Tab Parameters
export type AppTabParamList = {
    Home: NavigatorScreenParams<HomeStackParamList>;
    Exams: NavigatorScreenParams<ExamStackParamList>;
    Leaderboard: undefined;
    Admin: NavigatorScreenParams<AdminStackParamList>;
    Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Navigation Parameters
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    App: NavigatorScreenParams<AppTabParamList>;
    AdminApp: NavigatorScreenParams<AdminStackParamList>;
};

// Screen Props Types for Auth Stack
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
    NativeStackScreenProps<AuthStackParamList, T>;

// Screen Props Types for Home Stack
export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
    CompositeScreenProps<
        NativeStackScreenProps<HomeStackParamList, T>,
        BottomTabScreenProps<AppTabParamList, 'Home'>
    >;

// Screen Props Types for Exam Stack
export type ExamStackScreenProps<T extends keyof ExamStackParamList> =
    CompositeScreenProps<
        NativeStackScreenProps<ExamStackParamList, T>,
        BottomTabScreenProps<AppTabParamList, 'Exams'>
    >;

// Screen Props Types for Profile Stack
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
    CompositeScreenProps<
        NativeStackScreenProps<ProfileStackParamList, T>,
        BottomTabScreenProps<AppTabParamList, 'Profile'>
    >;

// Screen Props Types for Admin Stack
export type AdminStackScreenProps<T extends keyof AdminStackParamList> =
    NativeStackScreenProps<AdminStackParamList, T>;

// Screen Props Types for Settings Stack
export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
    NativeStackScreenProps<SettingsStackParamList, T>;

// Bottom Tab Screen Props
export type AppTabScreenProps<T extends keyof AppTabParamList> =
    BottomTabScreenProps<AppTabParamList, T>;

// Navigation Props Types
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type HomeStackNavigationProp =
    NativeStackNavigationProp<HomeStackParamList>;
export type ExamStackNavigationProp = NativeStackNavigationProp<ExamStackParamList>;
export type ProfileStackNavigationProp =
    NativeStackNavigationProp<ProfileStackParamList>;
export type AdminStackNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
export type AppTabNavigationProp = BottomTabNavigationProp<AppTabParamList>;
