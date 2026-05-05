import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DifficultySelector } from '../../components/exam/DifficultySelector';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useExam } from '../../hooks/useExam';
import { useExamStore } from '../../store/exam.store';
import { useMyModuleStatus } from '../../hooks/useSubscription';
import { ExamStackScreenProps } from '../../navigation/types';
import { formatNumber } from '../../utils/formatters';
import { questionApi } from '../../api/question.api';
import { queryKeys } from '../../api/queryClient';

type ExamConfigScreenProps = ExamStackScreenProps<'ExamConfig'>;

export const ExamConfigScreen: React.FC<ExamConfigScreenProps> = ({
    navigation,
    route,
}) => {
    const { examCategory, studentType, examType, year } = route.params;
    const { generateExam, isGeneratingExam } = useExam();
    const { data: moduleStatus, isFetching: isModuleStatusFetching } = useMyModuleStatus();
    const { startExam } = useExamStore();
    const isSubjectPractice = examCategory === 'subject';
    const [difficulty, setDifficulty] = useState<string>('mixed');
    const [questionCount, setQuestionCount] = useState<number>(50);
    const [timeLimit, setTimeLimit] = useState<number>(120); // minutes
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
    const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
    const [chapterDropdownOpen, setChapterDropdownOpen] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const scaleValue = useSharedValue(1);

    const {
        data: subjectChapterList = [],
        isLoading: isLoadingSubjectChapters,
    } = useQuery({
        queryKey: queryKeys.question.subjects(studentType, examType || 'license'),
        queryFn: () => questionApi.getSubjectChapters(studentType, examType || 'license'),
        enabled: isSubjectPractice,
    });

    useEffect(() => {
        if (!isSubjectPractice || subjectChapterList.length === 0 || selectedSubject) return;

        setSelectedSubject(subjectChapterList[0].subjectName);
    }, [isSubjectPractice, selectedSubject, subjectChapterList]);

    const selectedSubjectData = subjectChapterList.find(
        (item) => item.subjectName === selectedSubject
    );

    // Estimate time limit based on questions (assume ~1.2 min per question)
    useEffect(() => {
        const estimatedTime = Math.ceil(questionCount * 0.6);
        setTimeLimit(estimatedTime);
    }, [questionCount]);

    const createExamAttempt = async () => {
        const categoryMap: Record<string, 'mock_exam' | 'model_test' | 'practice' | 'year_exam'> = {
            past_exam: 'year_exam',
            year_exam: 'year_exam',
            model_test: 'model_test',
            subject: 'practice',
        };

        const mappedCategory = categoryMap[examCategory];
        if (!mappedCategory) {
            throw new Error(`Invalid exam category: ${examCategory}`);
        }

        const proportionalTimeSeconds = Math.ceil(questionCount * 0.6 * 60);

        const examData = await generateExam({
            studentType: studentType as any,
            examCategory: mappedCategory,
            examType: examType as 'license' | 'admission',
            timeLimitSeconds: proportionalTimeSeconds,
            questionCount,
            ...(year && { year }),
            ...(isSubjectPractice && selectedSubject && { subjectName: selectedSubject }),
            ...(isSubjectPractice && selectedChapters.length > 0 && {
                chapterNames: selectedChapters,
            }),
        });

        scaleValue.value = withSpring(1, { damping: 20, stiffness: 300 });

        if (examData && examData.attemptId && examData.questions) {
            startExam(
                examData.attemptId,
                examData.questions,
                examData.timeLimitSeconds,
                examData.startedAt
            );

            navigation.navigate('ExamSession', {
                attemptId: examData.attemptId,
                examCategory,
            });
            return;
        }

        throw new Error('Failed to start exam');
    };

    const handleStartExam = async () => {
        if (isStarting || isGeneratingExam) return;

        // Don't let the user start an exam until we've confirmed their module isn't locked.
        if (isModuleStatusFetching || !moduleStatus) return;

        if (moduleStatus.isLocked) {
            navigation.replace('ModuleUnavailable', {
                moduleLabel: moduleStatus.label || 'আপনার পরীক্ষার প্রস্তুতি',
                message: moduleStatus.message,
            });
            return;
        }

        if (isSubjectPractice && !selectedSubject) {
            Toast.show({
                type: 'error',
                text1: 'বিষয় নির্বাচন করুন',
                text2: 'অনুশীলনের জন্য অনুগ্রহ করে একটি বিষয় বেছে নিন।',
            });
            return;
        }

        setIsStarting(true);
        scaleValue.value = withSpring(0.95, { damping: 20, stiffness: 300 });

        try {
            await createExamAttempt();
        } catch (error: any) {
            scaleValue.value = withSpring(1, { damping: 20, stiffness: 300 });
            const status = error.response?.status;
            if (status !== 422 && status !== 402 && status !== 403) {
                console.error('[ExamConfigScreen] Error details:', {
                    status,
                    data: error.response?.data,
                    message: error.message,
                });
            }

            if (status === 402) {
                const backendMsg =
                    error.response?.data?.message ||
                    error.response?.data?.error?.message;
                const reason: 'category_locked' | 'quota_exceeded' =
                    examCategory === 'past_exam' || examCategory === 'year_exam'
                        ? 'quota_exceeded'
                        : 'category_locked';
                navigation.replace('SubscriptionRequired', {
                    reason,
                    message: backendMsg,
                });
            } else if (status === 403) {
                navigation.replace('ModuleUnavailable', {
                    moduleLabel:
                        error.response?.data?.data?.moduleLabel ||
                        error.response?.data?.data?.label ||
                        'আপনার পরীক্ষার প্রস্তুতি',
                    message:
                        error.response?.data?.message ||
                        error.response?.data?.error?.message ||
                        moduleStatus?.message,
                });
            } else if (status === 422) {
                Toast.show({
                    type: 'error',
                    text1: 'কোনো প্রশ্ন পাওয়া যায়নি',
                    text2:
                        error.response?.data?.message ||
                        error.response?.data?.error?.message ||
                        'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'পরীক্ষা শুরু করতে সমস্যা হয়েছে',
                    text2: error.response?.data?.message || error.message || 'কিছু একটা সমস্যা হয়েছে',
                });
            }
        } finally {
            setIsStarting(false);
        }
    };

    const getSummaryLabel = (): string => {
        switch (examCategory) {
            case 'past_exam':
            case 'year_exam':
                return year ? `${year} সালের পরীক্ষার প্রশ্ন` : 'পূর্বের পরীক্ষার প্রশ্ন';
            case 'model_test':
                return 'মডেল টেস্ট';
            case 'subject':
                return 'বিষয়ভিত্তিক অনুশীলন';
            default:
                return 'পরীক্ষা';
        }
    };

    const toggleChapter = (chapterName: string) => {
        setSelectedChapters((prev) =>
            prev.includes(chapterName)
                ? prev.filter((name) => name !== chapterName)
                : [...prev, chapterName]
        );
    };

    const difficultyOptions = [
        { value: 'easy', label: 'সহজ' },
        { value: 'medium', label: 'মাঝারি' },
        { value: 'hard', label: 'কঠিন' },
        { value: 'mixed', label: 'মিশ্র' },
    ];

    const difficultyLabel: Record<string, string> = {
        easy: 'সহজ',
        medium: 'মাঝারি',
        hard: 'কঠিন',
        mixed: 'মিশ্র',
    };

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Animated.View
                    entering={FadeInDown}
                    style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.lg }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginBottom: spacing.md }}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    <Text
                        style={{
                            fontSize: typography.scale['2xl'].fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.sm,
                        }}
                    >
                        পরীক্ষার কনফিগারেশন
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                        }}
                    >
                        আপনার পরীক্ষার সেটিংস কাস্টমাইজ করুন
                    </Text>
                </Animated.View>

                {/* Settings Cards */}
                <View style={{ paddingHorizontal: spacing.base, gap: spacing.base }}>
                    {/* Difficulty */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <Card>
                            <View style={{ marginBottom: spacing.md }}>
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: typography.weights.semibold,
                                        color: colors.textPrimary,
                                        marginBottom: spacing.md,
                                    }}
                                >
                                    কঠিনতার মাত্রা
                                </Text>
                                <DifficultySelector
                                    options={difficultyOptions}
                                    selected={difficulty}
                                    onSelect={setDifficulty}
                                />
                            </View>
                        </Card>
                    </Animated.View>

                    {isSubjectPractice && (
                        <Animated.View entering={FadeInDown.delay(150)}>
                            <Card>
                                <View style={{ gap: spacing.md }}>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        বিষয়
                                    </Text>

                                    {isLoadingSubjectChapters ? (
                                        <View style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
                                            <ActivityIndicator size="small" color={colors.primary} />
                                        </View>
                                    ) : subjectChapterList.length === 0 ? (
                                        <View
                                            style={{
                                                paddingVertical: spacing.md,
                                                paddingHorizontal: spacing.md,
                                                backgroundColor: colors.surfaceAlt,
                                                borderRadius: spacing.borderRadius.md,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                }}
                                            >
                                                আপনার প্রোগ্রাম ও লক্ষ্যের জন্য এখনও কোনো বিষয় যুক্ত হয়নি। একটু পরে আবার চেষ্টা করুন।
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => setSubjectDropdownOpen((prev) => !prev)}
                                                activeOpacity={0.7}
                                                style={{
                                                    paddingVertical: spacing.md,
                                                    paddingHorizontal: spacing.md,
                                                    backgroundColor: colors.surfaceAlt,
                                                    borderRadius: spacing.borderRadius.md,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: typography.scale.base.fontSize,
                                                        fontFamily: typography.fontBody,
                                                        fontWeight: typography.weights.semibold,
                                                        color: selectedSubject ? colors.textPrimary : colors.textSecondary,
                                                    }}
                                                >
                                                    {selectedSubject || 'বিষয় বেছে নিন'}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    name={subjectDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                                    size={24}
                                                    color={colors.textSecondary}
                                                />
                                            </TouchableOpacity>

                                            {subjectDropdownOpen && (
                                                <View
                                                    style={{
                                                        marginTop: spacing.xs,
                                                        backgroundColor: colors.surface,
                                                        borderRadius: spacing.borderRadius.md,
                                                        borderWidth: 1,
                                                        borderColor: colors.border,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {subjectChapterList.map((item, idx) => (
                                                        <TouchableOpacity
                                                            key={item.subjectName}
                                                            activeOpacity={0.7}
                                                            onPress={() => {
                                                                setSelectedSubject(item.subjectName);
                                                                setSelectedChapters([]);
                                                                setSubjectDropdownOpen(false);
                                                                setChapterDropdownOpen(false);
                                                            }}
                                                            style={{
                                                                paddingVertical: spacing.md,
                                                                paddingHorizontal: spacing.md,
                                                                borderBottomWidth:
                                                                    idx === subjectChapterList.length - 1 ? 0 : 1,
                                                                borderBottomColor: colors.surfaceAlt,
                                                                backgroundColor:
                                                                    item.subjectName === selectedSubject
                                                                        ? colors.primaryLight
                                                                        : colors.surface,
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: typography.scale.sm.fontSize,
                                                                    fontFamily: typography.fontBody,
                                                                    color: colors.textPrimary,
                                                                    fontWeight:
                                                                        item.subjectName === selectedSubject
                                                                            ? typography.weights.semibold
                                                                            : typography.weights.regular,
                                                                }}
                                                            >
                                                                {item.subjectName}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </>
                                    )}

                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        অধ্যায়
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => setChapterDropdownOpen((prev) => !prev)}
                                        disabled={!selectedSubjectData}
                                        activeOpacity={0.7}
                                        style={{
                                            paddingVertical: spacing.md,
                                            paddingHorizontal: spacing.md,
                                            backgroundColor: colors.surfaceAlt,
                                            borderRadius: spacing.borderRadius.md,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            opacity: selectedSubjectData ? 1 : 0.6,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.base.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: selectedChapters.length > 0 ? colors.textPrimary : colors.textSecondary,
                                            }}
                                        >
                                            {selectedChapters.length > 0
                                                ? `${selectedChapters.length}টি নির্বাচিত`
                                                : 'সব অধ্যায়'}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name={chapterDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                            size={24}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>

                                    {chapterDropdownOpen && selectedSubjectData && (
                                        <View
                                            style={{
                                                marginTop: spacing.xs,
                                                backgroundColor: colors.surface,
                                                borderRadius: spacing.borderRadius.md,
                                                borderWidth: 1,
                                                borderColor: colors.border,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {selectedSubjectData.chapters.length === 0 ? (
                                                <View
                                                    style={{
                                                        paddingVertical: spacing.md,
                                                        paddingHorizontal: spacing.md,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: typography.scale.sm.fontSize,
                                                            fontFamily: typography.fontBody,
                                                            color: colors.textSecondary,
                                                        }}
                                                    >
                                                        এই বিষয়ের জন্য কোনো অধ্যায় পাওয়া যায়নি।
                                                    </Text>
                                                </View>
                                            ) : (
                                                selectedSubjectData.chapters.map((chapter, idx) => {
                                                    const isSelected = selectedChapters.includes(chapter);
                                                    return (
                                                        <TouchableOpacity
                                                            key={chapter}
                                                            activeOpacity={0.7}
                                                            onPress={() => toggleChapter(chapter)}
                                                            style={{
                                                                paddingVertical: spacing.md,
                                                                paddingHorizontal: spacing.md,
                                                                borderBottomWidth:
                                                                    idx === selectedSubjectData.chapters.length - 1 ? 0 : 1,
                                                                borderBottomColor: colors.surfaceAlt,
                                                                flexDirection: 'row',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: typography.scale.sm.fontSize,
                                                                    fontFamily: typography.fontBody,
                                                                    color: colors.textPrimary,
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                {chapter}
                                                            </Text>
                                                            <MaterialCommunityIcons
                                                                name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                                                size={20}
                                                                color={isSelected ? colors.primary : colors.textSecondary}
                                                            />
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            )}
                                        </View>
                                    )}

                                    {selectedSubjectData && (
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            এই বিষয়ে মোট প্রশ্ন: {formatNumber(selectedSubjectData.questionCount)}
                                        </Text>
                                    )}
                                </View>
                            </Card>
                        </Animated.View>
                    )}

                    {/* Question Count */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Card>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                            marginBottom: spacing.xs,
                                        }}
                                    >
                                        প্রশ্নের সংখ্যা
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        {isSubjectPractice
                                            ? 'বিষয়ভিত্তিক অনুশীলনে উপলব্ধ প্রশ্ন ব্যবহার করা হয় (কোনো সর্বনিম্ন সীমা নেই)।'
                                            : 'মডেল টেস্ট: ১০০টি প্রশ্ন'}
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        fontSize: typography.scale.lg.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.primary,
                                    }}
                                >
                                    {formatNumber(questionCount)}
                                </Text>
                            </View>

                            {/* Question Slider */}
                            <View
                                style={{
                                    marginTop: spacing.md,
                                    flexDirection: 'row',
                                    gap: spacing.sm,
                                    justifyContent: 'space-between',
                                }}
                            >
                                {[25, 50, 75, 100].map((count) => (
                                    <TouchableOpacity
                                        key={count}
                                        onPress={() => setQuestionCount(count)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: spacing.sm,
                                            paddingHorizontal: spacing.xs,
                                            backgroundColor:
                                                questionCount === count
                                                    ? colors.primary
                                                    : colors.surfaceAlt,
                                            borderRadius: spacing.borderRadius.md,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                fontWeight: typography.weights.semibold,
                                                color:
                                                    questionCount === count
                                                        ? colors.textInverse
                                                        : colors.textSecondary,
                                            }}
                                        >
                                            {count}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Time Limit */}
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <Card>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                            marginBottom: spacing.xs,
                                        }}
                                    >
                                        আনুমানিক সময়
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        প্রায় {timeLimit} মিনিট
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.xs,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={20}
                                        color={colors.primary}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.lg.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        {Math.floor(timeLimit / 60)}ঘ {timeLimit % 60}মি
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Exam Summary */}
                    <Animated.View entering={FadeInDown.delay(400)}>
                        <Card
                            style={{
                                backgroundColor: colors.primaryLight,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.primary,
                            }}
                        >
                            <View style={{ gap: spacing.sm }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        পরীক্ষার ধরন
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {getSummaryLabel()}
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        লক্ষ্য
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {examType === 'admission' ? 'ভর্তি পরীক্ষা' : 'লাইসেন্স পরীক্ষা'}
                                    </Text>
                                </View>

                                {isSubjectPractice && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            নির্বাচিত বিষয়
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                fontWeight: typography.weights.semibold,
                                                color: colors.textPrimary,
                                                maxWidth: '60%',
                                                textAlign: 'right',
                                            }}
                                            numberOfLines={1}
                                        >
                                            {selectedSubject || 'নির্বাচন করা হয়নি'}
                                        </Text>
                                    </View>
                                )}

                                {isSubjectPractice && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            অধ্যায় ফিল্টার
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                fontWeight: typography.weights.semibold,
                                                color: colors.textPrimary,
                                            }}
                                        >
                                            {selectedChapters.length > 0 ? `${selectedChapters.length}টি নির্বাচিত` : 'সব'}
                                        </Text>
                                    </View>
                                )}

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        কঠিনতা
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {difficultyLabel[difficulty] || difficulty}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Start Button */}
                    <Animated.View entering={FadeInDown.delay(500)}>
                        <Button
                            label={isGeneratingExam ? 'পরীক্ষা শুরু হচ্ছে...' : 'পরীক্ষা শুরু করুন'}
                            variant="primary"
                            size="large"
                            onPress={handleStartExam}
                            disabled={isGeneratingExam || isStarting || isModuleStatusFetching || !moduleStatus}
                            rightIcon={
                                isGeneratingExam || isStarting ? (
                                    <ActivityIndicator color={colors.textInverse} />
                                ) : (
                                    'arrow-right'
                                )
                            }
                        />
                    </Animated.View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
