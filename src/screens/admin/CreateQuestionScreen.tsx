import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';
import { queryClient } from '../../api/queryClient';

interface QuestionFormData {
    questionVariants: string[];
    questionPattern: 'mcq' | 'true_false';
    options?: { text: string; orderIndex: number }[];
    statements?: { text: string; orderIndex: number }[];
    studentType: 'diploma_midwifery' | 'diploma_nursing_midwifery' | 'bsc_nursing' | 'post_basic_midwifery';
    examType: 'license' | 'admission';
    subjectName: string;
    chapterName: string;
    class?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    year?: number;
    totalMarkOfTheQuestion?: number;
    answerPattern?: 'single' | 'multiple';
    questionType?: 'text' | 'image';
    language?: 'english' | 'bangla';
    hints?: string[];
    tags?: string[];
    isActive?: boolean;
}

const STUDENT_TYPE_OPTIONS: Array<{ value: QuestionFormData['studentType']; label: string }> = [
    { value: 'diploma_midwifery', label: 'Diploma in Midwifery' },
    { value: 'diploma_nursing_midwifery', label: 'Diploma in Nursing & Midwifery' },
    { value: 'bsc_nursing', label: 'BSc Nursing' },
    { value: 'post_basic_midwifery', label: 'Post Basic in B.Sc Nursing' },
];

const EXAM_TYPE_OPTIONS: Array<{ value: QuestionFormData['examType']; label: string }> = [
    { value: 'license', label: 'License' },
    { value: 'admission', label: 'Admission' },
];

const DIFFICULTY_OPTIONS: Array<{ value: NonNullable<QuestionFormData['difficulty']>; label: string }> = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const ANSWER_PATTERN_OPTIONS: Array<{ value: NonNullable<QuestionFormData['answerPattern']>; label: string }> = [
    { value: 'single', label: 'Single Correct' },
    { value: 'multiple', label: 'Multiple Correct' },
];

const QUESTION_TYPE_OPTIONS: Array<{ value: NonNullable<QuestionFormData['questionType']>; label: string }> = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' },
];

const LANGUAGE_OPTIONS: Array<{ value: NonNullable<QuestionFormData['language']>; label: string }> = [
    { value: 'english', label: 'English' },
    { value: 'bangla', label: 'Bangla' },
];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
    return (
        <Text variant="md" weight="semibold" color="textPrimary" style={styles.sectionHeader}>
            {title}
        </Text>
    );
};

const Label: React.FC<{ title: string; required?: boolean; style?: any }> = ({
    title,
    required = false,
    style,
}) => {
    return (
        <Text variant="sm" weight="semibold" color="textPrimary" style={[{ marginBottom: 8 }, style]}>
            {title}
            {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
    );
};

const RadioButton: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
}> = ({ label, selected, onPress }) => (
    <TouchableOpacity style={styles.radioItem} onPress={onPress}>
        <View
            style={[
                styles.radioButton,
                {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : 'transparent',
                },
            ]}
        >
            {selected && (
                <MaterialCommunityIcons name="check" size={14} color={colors.textInverse} />
            )}
        </View>
        <Text variant="sm" color="textPrimary" style={{ marginLeft: 8 }}>
            {label}
        </Text>
    </TouchableOpacity>
);

export const CreateQuestionScreen: React.FC<AdminStackScreenProps<'CreateQuestion'>> = ({
    navigation,
}) => {
    const [formData, setFormData] = useState<QuestionFormData>({
        questionVariants: [''],
        questionPattern: 'mcq',
        studentType: 'diploma_midwifery',
        examType: 'license',
        subjectName: '',
        chapterName: '',
        class: '',
        difficulty: 'medium',
        totalMarkOfTheQuestion: 1,
        answerPattern: 'single',
        questionType: 'text',
        language: 'english',
        tags: [],
        isActive: true,
        options: [
            { text: '', orderIndex: 0 },
            { text: '', orderIndex: 1 },
            { text: '', orderIndex: 2 },
            { text: '', orderIndex: 3 },
        ],
        statements: [
            { text: '', orderIndex: 0 },
            { text: '', orderIndex: 1 },
            { text: '', orderIndex: 2 },
        ],
    });

    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
    const [correctStatementAnswers, setCorrectStatementAnswers] = useState<
        { orderIndex: number; answer: boolean }[]
    >([
        { orderIndex: 0, answer: true },
        { orderIndex: 1, answer: true },
        { orderIndex: 2, answer: true },
    ]);

    const createMutation = useMutation({
        mutationFn: async (data: QuestionFormData) => {
            const payload: any = {
                questionVariants: data.questionVariants.filter((v) => v.trim().length > 0),
                questionPattern: data.questionPattern,
                studentType: data.studentType,
                examType: data.examType,
                subjectName: data.subjectName,
                chapterName: data.chapterName,
                difficulty: data.difficulty,
                year: data.year,
                totalMarkOfTheQuestion: data.totalMarkOfTheQuestion,
                answerPattern: data.answerPattern,
                questionType: data.questionType,
                language: data.language,
                isActive: data.isActive ?? true,
                ...(data.class && data.class.trim() ? { class: data.class.trim() } : {}),
                ...(data.tags && data.tags.length > 0 ? { tags: data.tags } : {}),
            };

            if (data.questionPattern === 'mcq') {
                payload.options = data.options
                    ?.map((opt, idx) => ({
                        text: opt.text,
                        isCorrect: idx === correctAnswerIndex,
                    }))
                    .filter((opt) => opt.text.trim().length > 0);
            } else {
                payload.statements = data.statements
                    ?.map((stmt, idx) => ({
                        text: stmt.text,
                        isTrue: correctStatementAnswers[idx]?.answer ?? true,
                    }))
                    .filter((stmt) => stmt.text.trim().length > 0);
            }

            return adminApi.createQuestion(payload);
        },
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সফল',
                text2: 'প্রশ্ন সফলভাবে তৈরি হয়েছে',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
            setTimeout(() => navigation.goBack(), 1500);
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'ত্রুটি',
                text2:
                    error.response?.data?.error?.message ||
                    'প্রশ্ন তৈরি করা যায়নি',
            });
        },
    });

    const handleSubmit = () => {
        // Validation
        if (formData.questionVariants.every((v) => v.trim().length === 0)) {
            Alert.alert('ত্রুটি', 'অন্তত একটি প্রশ্নের ভ্যারিয়েন্ট লিখুন');
            return;
        }
        if (!formData.subjectName.trim()) {
            Alert.alert('ত্রুটি', 'বিষয়ের নাম লিখুন');
            return;
        }
        if (!formData.chapterName.trim()) {
            Alert.alert('ত্রুটি', 'অধ্যায়ের নাম লিখুন');
            return;
        }
        if (formData.questionPattern === 'mcq') {
            const validOptions = formData.options?.filter((opt) => opt.text.trim().length > 0) || [];
            if (validOptions.length < 4) {
                Alert.alert('ত্রুটি', 'এমসিকিউয়ের জন্য অন্তত ৪টি অপশন দিন');
                return;
            }
        } else {
            const validStatements = formData.statements?.filter((stmt) => stmt.text.trim().length > 0) || [];
            if (validStatements.length < 3) {
                Alert.alert('ত্রুটি', 'সত্য/মিথ্যার জন্য অন্তত ৩টি স্টেটমেন্ট দিন');
                return;
            }
        }

        createMutation.mutate(formData);
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Question Pattern Selection */}
                <View style={styles.section}>
                    <SectionHeader title="প্রশ্নের ধরন" />
                    <View style={styles.radioGroupRow}>
                        <RadioButton
                            label="বহুনির্বাচনী (এমসিকিউ)"
                            selected={formData.questionPattern === 'mcq'}
                            onPress={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    questionPattern: 'mcq',
                                }))
                            }
                        />
                        <RadioButton
                            label="সত্য/মিথ্যা"
                            selected={formData.questionPattern === 'true_false'}
                            onPress={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    questionPattern: 'true_false',
                                }))
                            }
                        />
                    </View>
                </View>

                {/* Question Variants */}
                <View style={styles.section}>
                    <SectionHeader title="প্রশ্নের ভ্যারিয়েন্ট" />
                    <Label title="প্রশ্নের টেক্সট" required />
                    {formData.questionVariants.map((variant, idx) => (
                        <View key={idx} style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder={`ভ্যারিয়েন্ট ${idx + 1}...`}
                                placeholderTextColor={colors.textTertiary}
                                value={variant}
                                onChangeText={(text) => {
                                    const newVariants = [...formData.questionVariants];
                                    newVariants[idx] = text;
                                    setFormData((prev) => ({
                                        ...prev,
                                        questionVariants: newVariants,
                                    }));
                                }}
                                multiline
                                numberOfLines={3}
                            />
                            {formData.questionVariants.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => {
                                        const newVariants = formData.questionVariants.filter(
                                            (_, i) => i !== idx
                                        );
                                        setFormData((prev) => ({
                                            ...prev,
                                            questionVariants: newVariants,
                                        }));
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={20}
                                        color={colors.danger}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    {formData.questionVariants.length < 5 && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    questionVariants: [...prev.questionVariants, ''],
                                }));
                            }}
                        >
                            <MaterialCommunityIcons
                                name="plus-circle"
                                size={20}
                                color={colors.primary}
                            />
                            <Text variant="sm" weight="semibold" color="primary" style={{ marginLeft: 8 }}>
                                ভ্যারিয়েন্ট যোগ করুন
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Classification */}
                <View style={styles.section}>
                    <SectionHeader title="শ্রেণিবিভাগ" />
                    <View>
                        <Label title="স্টুডেন্ট টাইপ" required />
                        <View style={styles.radioGroupColumn}>
                            {STUDENT_TYPE_OPTIONS.map((item) => (
                                <RadioButton
                                    key={item.value}
                                    label={item.label}
                                    selected={formData.studentType === item.value}
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            studentType: item.value,
                                        }))
                                    }
                                />
                            ))}
                        </View>
                    </View>

                    <Label title="পরীক্ষার ধরন" required style={{ marginTop: 12 }} />
                    <View style={styles.radioGroupRow}>
                        {EXAM_TYPE_OPTIONS.map((item) => (
                            <RadioButton
                                key={item.value}
                                label={item.label}
                                selected={formData.examType === item.value}
                                onPress={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        examType: item.value,
                                    }))
                                }
                            />
                        ))}
                    </View>

                    <Label title="বিষয়ের নাম" required style={{ marginTop: 12 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="যেমন: অ্যানাটমি, ফিজিওলজি..."
                        placeholderTextColor={colors.textTertiary}
                        value={formData.subjectName}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                subjectName: text,
                            }))
                        }
                    />

                    <Label title="অধ্যায়ের নাম" required style={{ marginTop: 12 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="যেমন: অধ্যায় ১: ভূমিকা..."
                        placeholderTextColor={colors.textTertiary}
                        value={formData.chapterName}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                chapterName: text,
                            }))
                        }
                    />

                    <Label title="ক্লাস (ঐচ্ছিক)" style={{ marginTop: 12 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="যেমন: নার্সিং ক্লাস, মিডওয়াইফারি ক্লাস..."
                        placeholderTextColor={colors.textTertiary}
                        value={formData.class || ''}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                class: text,
                            }))
                        }
                    />
                </View>

                {/* Additional Details */}
                <View style={styles.section}>
                    <SectionHeader title="অতিরিক্ত তথ্য" />
                    <Label title="কঠিনতা" />
                    <View style={styles.radioGroupRow}>
                        {DIFFICULTY_OPTIONS.map((item) => (
                            <RadioButton
                                key={item.value}
                                label={item.label}
                                selected={formData.difficulty === item.value}
                                onPress={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        difficulty: item.value,
                                    }))
                                }
                            />
                        ))}
                    </View>

                    <Label title="প্রশ্ন টাইপ" style={{ marginTop: 12 }} />
                    <View style={styles.radioGroupRow}>
                        {QUESTION_TYPE_OPTIONS.map((item) => (
                            <RadioButton
                                key={item.value}
                                label={item.label}
                                selected={formData.questionType === item.value}
                                onPress={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        questionType: item.value,
                                    }))
                                }
                            />
                        ))}
                    </View>

                    <Label title="ভাষা" style={{ marginTop: 12 }} />
                    <View style={styles.radioGroupRow}>
                        {LANGUAGE_OPTIONS.map((item) => (
                            <RadioButton
                                key={item.value}
                                label={item.label}
                                selected={formData.language === item.value}
                                onPress={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        language: item.value,
                                    }))
                                }
                            />
                        ))}
                    </View>

                    <Label title="ট্যাগ (ঐচ্ছিক)" style={{ marginTop: 12 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="ট্যাগ দিন (কমা দিয়ে আলাদা করুন, যেমন: গুরুত্বপূর্ণ, চূড়ান্ত পরীক্ষা)"
                        placeholderTextColor={colors.textTertiary}
                        value={formData.tags?.join(', ') || ''}
                        onChangeText={(text) => {
                            const tags = text
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter((tag) => tag.length > 0);
                            setFormData((prev) => ({
                                ...prev,
                                tags,
                            }));
                        }}
                        multiline
                        numberOfLines={2}
                    />

                    {formData.tags && formData.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {formData.tags.map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text variant="xs" color="textInverse" weight="semibold">
                                        {tag}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const updatedTags = formData.tags?.filter((_, i) => i !== idx) || [];
                                            setFormData((prev) => ({
                                                ...prev,
                                                tags: updatedTags,
                                            }));
                                        }}
                                        style={{ marginLeft: 6 }}
                                    >
                                        <MaterialCommunityIcons name="close" size={12} color={colors.textInverse} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={[styles.switchContainer, { marginTop: 12 }]}>
                        <Text variant="sm" weight="semibold" color="textPrimary">
                            প্রশ্ন সক্রিয়
                        </Text>
                        <Switch
                            value={formData.isActive ?? true}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    isActive: value,
                                }))
                            }
                            trackColor={{ false: colors.border, true: colors.success }}
                            thumbColor={formData.isActive ? colors.textInverse : colors.textTertiary}
                        />
                    </View>

                    {formData.questionPattern === 'mcq' && (
                        <>
                            <Label title="উত্তরের প্যাটার্ন" style={{ marginTop: 12 }} />
                            <View style={styles.radioGroupRow}>
                                {ANSWER_PATTERN_OPTIONS.map((item) => (
                                    <RadioButton
                                        key={item.value}
                                        label={item.label}
                                        selected={formData.answerPattern === item.value}
                                        onPress={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                answerPattern: item.value,
                                            }))
                                        }
                                    />
                                ))}
                            </View>
                        </>
                    )}

                    <Label title="সাল" style={{ marginTop: 12 }} />
                    <TextInput
                        style={styles.inputCompact}
                        placeholder="2024"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="number-pad"
                        value={formData.year?.toString() || ''}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                year: text ? parseInt(text, 10) : undefined,
                            }))
                        }
                    />

                    <Label title="নম্বর" style={{ marginTop: 12 }} />
                    <TextInput
                        style={styles.inputCompact}
                        placeholder="1"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                        value={formData.totalMarkOfTheQuestion?.toString() || ''}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                totalMarkOfTheQuestion: text ? parseFloat(text) : undefined,
                            }))
                        }
                    />
                </View>

                {/* MCQ Options or True/False Statements */}
                {formData.questionPattern === 'mcq' ? (
                    <View style={styles.section}>
                        <SectionHeader title="অপশন (৪-৫টি প্রয়োজন)" />
                        {formData.options?.map((option, idx) => (
                            <View key={idx} style={styles.optionWrapper}>
                                <View style={styles.optionContent}>
                                    <View
                                        style={[
                                            styles.optionIndex,
                                            {
                                                backgroundColor:
                                                    correctAnswerIndex === idx
                                                        ? colors.success
                                                        : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            variant="xs"
                                            weight="bold"
                                            color={
                                                correctAnswerIndex === idx
                                                    ? 'textInverse'
                                                    : 'textSecondary'
                                            }
                                        >
                                            {String.fromCharCode(65 + idx)}
                                        </Text>
                                    </View>
                                    <TextInput
                                        style={styles.optionInput}
                                        placeholder={`অপশন ${idx + 1}...`}
                                        placeholderTextColor={colors.textTertiary}
                                        value={option.text}
                                        onChangeText={(text) => {
                                            const newOptions = [...(formData.options || [])];
                                            newOptions[idx].text = text;
                                            setFormData((prev) => ({
                                                ...prev,
                                                options: newOptions,
                                            }));
                                        }}
                                        multiline
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.correctButton,
                                        {
                                            backgroundColor:
                                                correctAnswerIndex === idx
                                                    ? colors.success
                                                    : colors.border,
                                        },
                                    ]}
                                    onPress={() => setCorrectAnswerIndex(idx)}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            correctAnswerIndex === idx ? 'check-circle' : 'circle-outline'
                                        }
                                        size={20}
                                        color={
                                            correctAnswerIndex === idx ? colors.textInverse : colors.textTertiary
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.section}>
                        <SectionHeader title="স্টেটমেন্ট (৩-৭টি প্রয়োজন)" />
                        {formData.statements?.map((statement, idx) => (
                            <View key={idx} style={styles.statementWrapper}>
                                <TextInput
                                    style={styles.statementInput}
                                    placeholder={`স্টেটমেন্ট ${idx + 1}...`}
                                    placeholderTextColor={colors.textTertiary}
                                    value={statement.text}
                                    onChangeText={(text) => {
                                        const newStatements = [...(formData.statements || [])];
                                        newStatements[idx].text = text;
                                        setFormData((prev) => ({
                                            ...prev,
                                            statements: newStatements,
                                        }));
                                    }}
                                    multiline
                                    numberOfLines={2}
                                />
                                <View style={styles.statementAnswerRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.answerButton,
                                            {
                                                backgroundColor:
                                                    correctStatementAnswers[idx]?.answer === true
                                                        ? colors.success
                                                        : colors.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            const newAnswers = [...correctStatementAnswers];
                                            newAnswers[idx] = { orderIndex: idx, answer: true };
                                            setCorrectStatementAnswers(newAnswers);
                                        }}
                                    >
                                        <Text
                                            variant="xs"
                                            weight="bold"
                                            color={
                                                correctStatementAnswers[idx]?.answer === true
                                                    ? 'textInverse'
                                                    : 'textSecondary'
                                            }
                                        >
                                            সত্য
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.answerButton,
                                            {
                                                backgroundColor:
                                                    correctStatementAnswers[idx]?.answer === false
                                                        ? colors.danger
                                                        : colors.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            const newAnswers = [...correctStatementAnswers];
                                            newAnswers[idx] = { orderIndex: idx, answer: false };
                                            setCorrectStatementAnswers(newAnswers);
                                        }}
                                    >
                                        <Text
                                            variant="xs"
                                            weight="bold"
                                            color={
                                                correctStatementAnswers[idx]?.answer === false
                                                    ? 'textInverse'
                                                    : 'textSecondary'
                                            }
                                        >
                                            মিথ্যা
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {formData.statements && formData.statements.length < 7 && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => {
                                    const newStatements = [
                                        ...(formData.statements || []),
                                        {
                                            text: '',
                                            orderIndex: (formData.statements?.length || 0),
                                        },
                                    ];
                                    setFormData((prev) => ({
                                        ...prev,
                                        statements: newStatements,
                                    }));
                                    setCorrectStatementAnswers((prev) => [
                                        ...prev,
                                        {
                                            orderIndex: newStatements.length - 1,
                                            answer: true,
                                        },
                                    ]);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="plus-circle"
                                    size={20}
                                    color={colors.primary}
                                />
                                <Text
                                    variant="sm"
                                    weight="semibold"
                                    color="primary"
                                    style={{ marginLeft: 8 }}
                                >
                                    স্টেটমেন্ট যোগ করুন
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={createMutation.isPending}
                    activeOpacity={0.8}
                >
                    {createMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.textInverse} />
                    ) : (
                        <Text variant="md" weight="semibold" color="textInverse">
                            প্রশ্ন তৈরি করুন
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingTop: spacing.base,
        paddingBottom: 12,
    },
    section: {
        marginBottom: 20,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    radioGroupRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    radioGroupColumn: {
        gap: 10,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        marginBottom: 12,
        position: 'relative',
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        borderStyle: 'dashed',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfColumn: {
        flex: 1,
        marginRight: 8,
    },
    inputCompact: {
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
    },
    optionWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 8,
    },
    optionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    optionIndex: {
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    optionInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 13,
        color: colors.textPrimary,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    correctButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    statementWrapper: {
        marginBottom: 12,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 8,
    },
    statementInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 13,
        color: colors.textPrimary,
        minHeight: 60,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    statementAnswerRow: {
        flexDirection: 'row',
        gap: 8,
    },
    answerButton: {
        flex: 1,
        height: 40,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    tag: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
});


