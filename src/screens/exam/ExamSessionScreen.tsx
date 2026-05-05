import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Animated as RNAnimated,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    FadeOutUp,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useSubmitExam } from '../../hooks/useExam';
import { useHaptics } from '../../hooks/useHaptics';
import { useExamStore } from '../../store/exam.store';
import { ExamStackScreenProps } from '../../navigation/types';
import { formatTime } from '../../utils/formatters';
import { questionApi } from '../../api/question.api';


type ExamSessionScreenProps = ExamStackScreenProps<'ExamSession'>;

interface UserAnswers {
    [questionId: string]: {
        type: 'mcq' | 'true_false';
        mcqAnswer?: number; // For MCQ: option index
        tfAnswers?: { [statementIndex: number]: boolean }; // For T/F: statement true/false values
    };
}

const DRAFT_KEY_PREFIX = 'exam_draft_';

/**
 * ExamSessionScreen - Real exam session with questions fetched from API
 * Handles question display, answer selection, timer, and submission
 */
export const ExamSessionScreen: React.FC<ExamSessionScreenProps> = ({
    navigation,
    route,
}) => {
    const { attemptId } = route.params;
    const { triggerSuccess, triggerWarning } = useHaptics();
    const { questions, timeLimitSeconds } = useExamStore();
    const submitExamMutation = useSubmitExam();

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [showHints, setShowHints] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [startTime] = useState(Date.now());
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hintUsageRecordedRef = useRef<Set<string>>(new Set());

    const REPORT_REASONS = [
        'ভুল উত্তরকে সঠিক হিসেবে চিহ্নিত করা হয়েছে',
        'প্রশ্নের ভাষা অস্পষ্ট বা দ্বিধাজনক',
        'বানান বা ফরম্যাটিং ভুল',
        'একই প্রশ্ন একাধিকবার এসেছে',
        'সিলেবাসের বাইরের / প্রাসঙ্গিক নয়',
        'অন্য কোনো সমস্যা',
    ];

    useEffect(() => {
        setShowHints(false);
    }, [currentQuestionIndex]);

    const handleToggleHints = () => {
        const nextShow = !showHints;
        setShowHints(nextShow);

        if (!nextShow) return;

        const questionId = questions?.[currentQuestionIndex]?._id;
        if (!questionId || hintUsageRecordedRef.current.has(questionId)) return;

        hintUsageRecordedRef.current.add(questionId);
        questionApi.recordHintUsage(questionId).catch((err) => {
            console.warn('[ExamSession] Failed to record hint usage:', err);
        });
    };

    // Initialize time from exam attempt
    useEffect(() => {
        if (timeLimitSeconds) {
            setTimeRemaining(timeLimitSeconds);
        }
    }, [timeLimitSeconds]);

    // Restore draft answers on mount
    useEffect(() => {
        const restoreDraft = async () => {
            try {
                const savedAnswers = await AsyncStorage.getItem(
                    `${DRAFT_KEY_PREFIX}${attemptId}`
                );
                if (savedAnswers) {
                    setUserAnswers(JSON.parse(savedAnswers));
                    Toast.show({
                        type: 'info',
                        text1: 'পরীক্ষা পুনরায় শুরু হয়েছে',
                        text2: 'আপনার আগের উত্তরগুলো ফিরিয়ে আনা হয়েছে',
                        visibilityTime: 2000,
                    });
                }
            } catch (error) {
                console.error('[ExamSession] Error restoring draft:', error);
            }
        };

        restoreDraft();
    }, [attemptId]);

    // Timer effect - countdown
    useEffect(() => {
        if (timeRemaining === null) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (!prev || prev <= 0) return 0;

                const newTime = prev - 1;

                // Haptic warnings
                if (newTime === 120) {
                    triggerWarning();
                    Toast.show({
                        type: 'info',
                        text1: '২ মিনিট বাকি',
                        visibilityTime: 2000,
                    });
                }

                if (newTime === 60) {
                    triggerWarning();
                    Toast.show({
                        type: 'info',
                        text1: '১ মিনিট বাকি',
                        visibilityTime: 2000,
                    });
                }

                // Auto-submit when time expires
                if (newTime <= 0) {
                    clearInterval(interval);
                    handleSubmitExam();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        timeIntervalRef.current = interval;

        return () => {
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, [timeRemaining]);

    // Auto-save draft answers every 30 seconds
    useEffect(() => {
        const saveDraft = async () => {
            try {
                await AsyncStorage.setItem(
                    `${DRAFT_KEY_PREFIX}${attemptId}`,
                    JSON.stringify(userAnswers)
                );
            } catch (error) {
                console.error('[ExamSession] Error saving draft:', error);
            }
        };

        const draftInterval = setInterval(saveDraft, 30000);

        return () => clearInterval(draftInterval);
    }, [userAnswers, attemptId]);

    const handleSelectOption = (optionIndex: number) => {
        const currentQuestion = questions![currentQuestionIndex];
        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion._id]: {
                type: 'mcq',
                mcqAnswer: optionIndex,
            },
        }));
        triggerSuccess();
    };

    const handleSelectTrueOrFalse = (statementIndex: number, value: boolean) => {
        const currentQuestion = questions![currentQuestionIndex];
        setUserAnswers((prev) => {
            const existing = prev[currentQuestion._id] || { type: 'true_false', tfAnswers: {} };
            return {
                ...prev,
                [currentQuestion._id]: {
                    type: 'true_false',
                    tfAnswers: {
                        ...existing.tfAnswers,
                        [statementIndex]: value,
                    },
                },
            };
        });
        triggerSuccess();
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleNextQuestion = () => {
        if (questions && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleSubmitExam = async () => {
        if (submitExamMutation.isPending) return;

        try {
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }

            const totalTimeTakenSeconds = Math.floor(
                (Date.now() - startTime) / 1000
            );

            // Format answers for submission - handle both MCQ and True/False
            const answers = Object.entries(userAnswers).map(([questionId, answer]) => {
                const question = questions!.find(q => q._id === questionId);
                const variantIndex = question?.variantIndex || 0;

                if (answer.type === 'mcq') {
                    return {
                        questionId,
                        selectedVariantIndex: variantIndex,
                        selectedOptionIndex: answer.mcqAnswer,
                    };
                } else {
                    // True/False question
                    const statementAnswers = Object.entries(answer.tfAnswers || {})
                        .map(([stmtIdx, value]) => ({
                            statementIndex: parseInt(stmtIdx),
                            selectedValue: value,
                        }));
                    return {
                        questionId,
                        selectedVariantIndex: variantIndex,
                        statementAnswers,
                    };
                }
            });

            // Submit exam
            await submitExamMutation.mutateAsync({
                attemptId,
                answers,
                totalTimeTakenSeconds,
            });

            // Clear draft
            await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${attemptId}`);

            Toast.show({
                type: 'success',
                text1: 'পরীক্ষা জমা দেওয়া হয়েছে',
                text2: 'আপনার পরীক্ষা সফলভাবে জমা হয়েছে',
            });

            // Navigate to result screen
            navigation.replace('ExamResult', { attemptId });
        } catch (error: any) {
            console.error('[ExamSession] Submission error:', error);
            Toast.show({
                type: 'error',
                text1: 'জমা দিতে সমস্যা হয়েছে',
                text2: error?.response?.data?.message || error?.message || 'আবার চেষ্টা করুন',
            });
        }
    };

    const handleReportQuestion = () => {
        if (!questions || isReporting) return;
        const questionId = questions[currentQuestionIndex]?._id;
        if (!questionId) return;
        setReportModalVisible(true);
    };

    const submitReport = async (reason: string) => {
        if (!questions || isReporting) return;
        const questionId = questions[currentQuestionIndex]?._id;
        if (!questionId) return;

        setReportModalVisible(false);
        try {
            setIsReporting(true);
            await questionApi.reportQuestion(
                questionId,
                reason,
                'পরীক্ষার সময় রিপোর্ট করা হয়েছে।'
            );
            Toast.show({
                type: 'success',
                text1: 'প্রশ্ন রিপোর্ট করা হয়েছে',
                text2: 'ধন্যবাদ। আমাদের টিম প্রশ্নটি পর্যালোচনা করবে।',
            });
        } catch (error: any) {
            const isDuplicate = error?.status === 409;
            Toast.show({
                type: isDuplicate ? 'info' : 'error',
                text1: isDuplicate ? 'আগেই রিপোর্ট করেছেন' : 'রিপোর্ট করতে সমস্যা হয়েছে',
                text2:
                    error?.message ||
                    (isDuplicate
                        ? 'আপনি এই প্রশ্নটি আগেই রিপোর্ট করেছেন।'
                        : 'এই মুহূর্তে রিপোর্ট জমা দেওয়া যাচ্ছে না।'),
            });
        } finally {
            setIsReporting(false);
        }
    };

    // Error state - check if questions are loaded from store
    if (!questions || questions.length === 0) {
        return (
            <ScreenWrapper>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: spacing.lg,
                    }}
                >
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={64}
                        color={colors.error}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.md,
                            textAlign: 'center',
                        }}
                    >
                        পরীক্ষা লোড করা যায়নি
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            textAlign: 'center',
                            marginBottom: spacing.lg,
                        }}
                    >
                        কোনো প্রশ্ন পাওয়া যায়নি
                    </Text>
                    <Button
                        label="ফিরে যান"
                        onPress={() => navigation.goBack()}
                        variant="primary"
                    />
                </View>
            </ScreenWrapper>
        );
    }
    const currentQuestion = questions[currentQuestionIndex];

    // Check if current question has required fields
    if (!currentQuestion || (!currentQuestion.options && !currentQuestion.statements)) {
        return (
            <ScreenWrapper>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: spacing.lg,
                    }}
                >
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={64}
                        color={colors.error}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.md,
                            textAlign: 'center',
                        }}
                    >
                        প্রশ্ন পাওয়া যাচ্ছে না
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            textAlign: 'center',
                            marginBottom: spacing.lg,
                        }}
                    >
                        প্রশ্নের অপশন লোড করা যায়নি
                    </Text>
                    <Button
                        label="ফিরে যান"
                        onPress={() => navigation.goBack()}
                        variant="primary"
                    />
                </View>
            </ScreenWrapper>
        );
    }

    const currentAnswer = userAnswers[currentQuestion._id];
    const answeredCount = Object.values(userAnswers).filter((answer) => {
        if (answer.type === 'mcq') {
            return answer.mcqAnswer !== undefined && answer.mcqAnswer !== null;
        } else if (answer.type === 'true_false') {
            return Object.values(answer.tfAnswers || {}).length > 0;
        }
        return false;
    }).length;
    const timeDisplay = timeRemaining !== null ? formatTime(timeRemaining) : '00:00';

    return (
        <ScreenWrapper scrollable={false} safeTop={false}>
            {/* Header with Timer */}
            <Animated.View entering={FadeInDown}>
                <View
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.base,
                        gap: spacing.sm,
                    }}
                >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            fontWeight: typography.weights.semibold,
                            color: colors.textInverse,
                            flex: 1,
                        }}
                        numberOfLines={1}
                    >
                        পরীক্ষা চলছে
                    </Text>

                    {/* Timer */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.xs,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                            borderRadius: spacing.borderRadius.md,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={16}
                            color={colors.textInverse}
                        />
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: timeRemaining && timeRemaining < 60 ? colors.error : colors.textInverse,
                            }}
                        >
                            {timeDisplay}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View
                    style={{
                        height: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: spacing.borderRadius.full,
                        overflow: 'hidden',
                    }}
                >
                    <View
                        style={{
                            height: '100%',
                            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                            backgroundColor: colors.accent,
                        }}
                    />
                </View>
                </View>
            </Animated.View>

            {/* Question and Options */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, paddingHorizontal: spacing.base }}
            >
                {/* Question Info */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <View
                        style={{
                            marginTop: spacing.lg,
                            marginBottom: spacing.base,
                        }}
                    >
                    <Text
                        style={{
                            fontSize: typography.scale.xs.fontSize,
                            fontFamily: typography.fontBody,
                            fontWeight: typography.weights.semibold,
                            color: colors.textSecondary,
                            marginBottom: spacing.md,
                        }}
                    >
                        প্রশ্ন {currentQuestionIndex + 1} / {questions.length}
                    </Text>

                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            lineHeight: typography.scale.base.fontSize * 1.5,
                        }}
                    >
                        {currentQuestion.question}
                    </Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            gap: spacing.sm,
                            marginTop: spacing.md,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleToggleHints}
                            style={{
                                paddingVertical: spacing.xs,
                                paddingHorizontal: spacing.md,
                                borderRadius: spacing.borderRadius.md,
                                backgroundColor: colors.primaryLight,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.xs,
                            }}
                        >
                            <MaterialCommunityIcons
                                name={showHints ? 'lightbulb-on' : 'lightbulb-outline'}
                                size={16}
                                color={colors.primary}
                            />
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.primary,
                                    fontWeight: typography.weights.semibold,
                                }}
                            >
                                {showHints ? 'হিন্ট লুকান' : 'হিন্ট দেখুন'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleReportQuestion}
                            disabled={isReporting}
                            style={{
                                paddingVertical: spacing.xs,
                                paddingHorizontal: spacing.md,
                                borderRadius: spacing.borderRadius.md,
                                backgroundColor: colors.errorLight,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.xs,
                                opacity: isReporting ? 0.7 : 1,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="flag-outline"
                                size={16}
                                color={colors.error}
                            />
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.error,
                                    fontWeight: typography.weights.semibold,
                                }}
                            >
                                {isReporting ? 'রিপোর্ট হচ্ছে...' : 'রিপোর্ট'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showHints && (
                        <View
                            style={{
                                marginTop: spacing.md,
                                padding: spacing.md,
                                backgroundColor: colors.primaryLight,
                                borderRadius: spacing.borderRadius.md,
                                borderWidth: 1,
                                borderColor: colors.primary,
                                gap: spacing.xs,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.bold,
                                    color: colors.primary,
                                }}
                            >
                                হিন্ট
                            </Text>
                            {currentQuestion.hints && currentQuestion.hints.length > 0 ? (
                                currentQuestion.hints.map((hint, index) => (
                                    <Text
                                        key={`${currentQuestion._id}-hint-${index}`}
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textPrimary,
                                            lineHeight: typography.scale.xs.fontSize * 1.5,
                                        }}
                                    >
                                        {index + 1}. {hint}
                                    </Text>
                                ))
                            ) : (
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    এই প্রশ্নের জন্য কোনো হিন্ট নেই।
                                </Text>
                            )}
                        </View>
                    )}
                    </View>
                </Animated.View>

                {/* MCQ Options or True/False Statements */}
                <View style={{ gap: spacing.base, marginBottom: spacing.lg }}>
                    {currentQuestion.questionPattern === 'mcq' && currentQuestion.options?.map((option, index) => {
                        const mcqAnswer = currentAnswer?.mcqAnswer;
                        return (
                            <TouchableOpacity
                                key={`option-${option.orderIndex || index}`}
                                onPress={() => handleSelectOption(index)}
                                style={{
                                    borderWidth: 2,
                                    borderColor:
                                        mcqAnswer === index
                                            ? colors.primary
                                            : colors.surfaceAlt,
                                    borderRadius: spacing.borderRadius.md,
                                    padding: spacing.base,
                                    backgroundColor:
                                        mcqAnswer === index
                                            ? `${colors.primary}10`
                                            : colors.surface,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            borderWidth: 2,
                                            borderColor:
                                                mcqAnswer === index
                                                    ? colors.primary
                                                    : colors.textSecondary,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {mcqAnswer === index && (
                                            <View
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: colors.primary,
                                                }}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textPrimary,
                                            flex: 1,
                                        }}
                                    >
                                        {option.text}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {currentQuestion.questionPattern === 'true_false' && currentQuestion.statements?.map((statement, index) => {
                        const currentAnswer = userAnswers[currentQuestion._id];
                        const statementAnswer = currentAnswer?.tfAnswers?.[index];
                        return (
                            <View
                                key={`statement-${index}`}
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.surfaceAlt,
                                    borderRadius: spacing.borderRadius.md,
                                    padding: spacing.base,
                                    backgroundColor: colors.surface,
                                    marginBottom: spacing.sm,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textPrimary,
                                        marginBottom: spacing.md,
                                        lineHeight: typography.scale.sm.fontSize * 1.5,
                                    }}
                                >
                                    {statement.text}
                                </Text>

                                {/* True/False Buttons */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        gap: spacing.sm,
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleSelectTrueOrFalse(index, true)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: spacing.md,
                                            paddingHorizontal: spacing.base,
                                            borderRadius: spacing.borderRadius.md,
                                            borderWidth: 2,
                                            borderColor:
                                                statementAnswer === true
                                                    ? colors.success
                                                    : colors.surfaceAlt,
                                            backgroundColor:
                                                statementAnswer === true
                                                    ? `${colors.success}15`
                                                    : colors.surface,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.sm.fontSize,
                                                fontFamily: typography.fontDisplay,
                                                fontWeight: typography.weights.bold,
                                                color:
                                                    statementAnswer === true
                                                        ? colors.success
                                                        : colors.textSecondary,
                                            }}
                                        >
                                            সত্য
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleSelectTrueOrFalse(index, false)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: spacing.md,
                                            paddingHorizontal: spacing.base,
                                            borderRadius: spacing.borderRadius.md,
                                            borderWidth: 2,
                                            borderColor:
                                                statementAnswer === false
                                                    ? colors.error
                                                    : colors.surfaceAlt,
                                            backgroundColor:
                                                statementAnswer === false
                                                    ? `${colors.error}15`
                                                    : colors.surface,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.sm.fontSize,
                                                fontFamily: typography.fontDisplay,
                                                fontWeight: typography.weights.bold,
                                                color:
                                                    statementAnswer === false
                                                        ? colors.error
                                                        : colors.textSecondary,
                                            }}
                                        >
                                            মিথ্যা
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Question Stats */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginBottom: spacing.lg,
                        paddingVertical: spacing.md,
                        borderTopWidth: 1,
                        borderTopColor: colors.surfaceAlt,
                    }}
                >
                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontWeight: typography.weights.semibold,
                                color: colors.primary,
                            }}
                        >
                            {answeredCount}
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                color: colors.textSecondary,
                            }}
                        >
                            উত্তর দেওয়া হয়েছে
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontWeight: typography.weights.semibold,
                                color: colors.warning,
                            }}
                        >
                            {questions.length - answeredCount}
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                color: colors.textSecondary,
                            }}
                        >
                            বাকি আছে
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Buttons */}
            <View
                style={{
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.base,
                    gap: spacing.base,
                    borderTopWidth: 1,
                    borderTopColor: colors.surfaceAlt,
                    backgroundColor: colors.surface,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        gap: spacing.base,
                    }}
                >
                    <Button
                        label="← পূর্ববর্তী"
                        onPress={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        variant="secondary"
                        style={{ flex: 1 }}
                    />
                    <Button
                        label={currentQuestionIndex === questions.length - 1 ? 'জমা দিন' : 'পরবর্তী →'}
                        onPress={
                            currentQuestionIndex === questions.length - 1
                                ? handleSubmitExam
                                : handleNextQuestion
                        }
                        isLoading={submitExamMutation.isPending}
                        variant="primary"
                        style={{ flex: 1 }}
                    />
                </View>
            </View>

            {/* Report Reason Picker */}
            <Modal
                visible={reportModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setReportModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setReportModalVisible(false)}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        paddingHorizontal: spacing.lg,
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => { }}
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: spacing.borderRadius.lg,
                            padding: spacing.lg,
                            gap: spacing.md,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: typography.scale.base.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: colors.textPrimary,
                            }}
                        >
                            প্রশ্ন রিপোর্ট করুন
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                color: colors.textSecondary,
                            }}
                        >
                            আমাদের টিম যেন এই প্রশ্নটি পর্যালোচনা করতে পারে, সেজন্য একটি কারণ বেছে নিন।
                        </Text>

                        <View style={{ gap: spacing.sm }}>
                            {REPORT_REASONS.map((reason) => (
                                <TouchableOpacity
                                    key={reason}
                                    onPress={() => submitReport(reason)}
                                    disabled={isReporting}
                                    style={{
                                        paddingVertical: spacing.md,
                                        paddingHorizontal: spacing.base,
                                        borderRadius: spacing.borderRadius.md,
                                        borderWidth: 1,
                                        borderColor: colors.surfaceAlt,
                                        backgroundColor: colors.background,
                                        opacity: isReporting ? 0.6 : 1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {reason}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setReportModalVisible(false)}
                            disabled={isReporting}
                            style={{
                                marginTop: spacing.xs,
                                paddingVertical: spacing.sm,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.textSecondary,
                                }}
                            >
                                বাতিল
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ScreenWrapper>
    );
};
