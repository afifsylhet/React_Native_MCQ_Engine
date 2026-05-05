import { Question, ExamAnswer, StudentType } from './api.types';

export interface ExamSessionState {
    attemptId: string | null;
    questions: Question[] | null;
    answers: Record<string, ExamAnswer>;
    currentQuestionIndex: number;
    startedAt: string | null;
    timeLimitSeconds: number | null;
    isSubmitting: boolean;
    isSubmitted: boolean;
}

export interface GenerateExamPayload {
    examCategory: 'mock_exam' | 'model_test' | 'practice' | 'year_exam';
    studentType: StudentType;
    examType: 'license' | 'admission';
    timeLimitSeconds: number;
    questionCount?: number;
    chapterNames?: string[];
    subjectName?: string;
    year?: number;
}

export interface SubmitExamPayload {
    answers: ExamAnswer[];
    totalTimeTakenSeconds: number;
}

export interface ExamHistoryFilters {
    page?: number;
    limit?: number;
    status?: 'passed' | 'failed' | 'submitted';
    examCategory?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}
