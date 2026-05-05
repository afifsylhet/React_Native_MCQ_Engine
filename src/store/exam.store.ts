import { create } from 'zustand';
import { Question, ExamAnswer } from '../types/api.types';

interface ExamSessionState {
    attemptId: string | null;
    questions: Question[] | null;
    answers: Record<string, ExamAnswer>;
    currentQuestionIndex: number;
    startedAt: string | null;
    timeLimitSeconds: number | null;
    isSubmitting: boolean;
    isSubmitted: boolean;
    startExam: (
        attemptId: string,
        questions: Question[],
        timeLimitSeconds: number,
        startedAt: string
    ) => void;
    setAnswer: (questionId: string, answer: ExamAnswer) => void;
    setCurrentIndex: (index: number) => void;
    setSubmitting: (submitting: boolean) => void;
    clearExam: () => void;
}

export const useExamStore = create<ExamSessionState>((set) => ({
    attemptId: null,
    questions: null,
    answers: {},
    currentQuestionIndex: 0,
    startedAt: null,
    timeLimitSeconds: null,
    isSubmitting: false,
    isSubmitted: false,

    startExam: (attemptId, questions, timeLimitSeconds, startedAt) => {
        set({
            attemptId,
            questions,
            timeLimitSeconds,
            startedAt,
            answers: {},
            currentQuestionIndex: 0,
            isSubmitting: false,
            isSubmitted: false,
        });
    },

    setAnswer: (questionId, answer) => {
        set((state) => ({
            answers: {
                ...state.answers,
                [questionId]: answer,
            },
        }));
    },

    setCurrentIndex: (index) => {
        set({ currentQuestionIndex: index });
    },

    setSubmitting: (submitting) => {
        set({ isSubmitting: submitting });
    },

    clearExam: () => {
        set({
            attemptId: null,
            questions: null,
            answers: {},
            currentQuestionIndex: 0,
            startedAt: null,
            timeLimitSeconds: null,
            isSubmitting: false,
            isSubmitted: true,
        });
    },
}));
