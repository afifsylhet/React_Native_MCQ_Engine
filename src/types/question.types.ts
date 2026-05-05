export interface Question {
    id: string;
    text: string;
    questionPattern: 'mcq' | 'true_false';
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionFilters {
    page?: number;
    limit?: number;
    difficulty?: string;
    studentType?: string;
    examType?: string;
    subjectName?: string;
    chapterName?: string;
    questionPattern?: string;
    year?: number;
    search?: string;
}
