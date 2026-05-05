import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ExamStackScreenProps } from '../../navigation/types';
import { useExamResult } from '../../hooks/useExam';
import { AnswerWithResult } from '../../types/api.types';

type ExamReviewScreenProps = ExamStackScreenProps<'ExamReview'>;

export const ExamReviewScreen: React.FC<ExamReviewScreenProps> = ({
    navigation,
    route,
}) => {
    const { attemptId } = route.params;
    const { data: result, isLoading, error } = useExamResult(attemptId);
    const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

    if (isLoading) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (error || !result || !result.answers || result.answers.length === 0) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View style={{ flex: 1, paddingHorizontal: spacing.base }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <EmptyState
                        icon="alert-circle-outline"
                        title="পর্যালোচনা পাওয়া যাচ্ছে না"
                        description="এই অ্যাটেম্পটের পর্যালোচনা লোড করা যায়নি।"
                    />
                </View>
            </ScreenWrapper>
        );
    }

    const answers: AnswerWithResult[] = result.answers;
    const totalQuestions = answers.length;
    const currentAnswer = answers[selectedQuestion];
    const correctCount = result.correctAnswers ?? answers.filter((a) => a.isCorrect).length;
    const wrongCount = result.wrongAnswers ?? totalQuestions - correctCount;

    const renderQuestionListItem = ({
        item,
        index,
    }: {
        item: AnswerWithResult;
        index: number;
    }) => (
        <TouchableOpacity
            onPress={() => setSelectedQuestion(index)}
            style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
            }}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: spacing.borderRadius.md,
                    backgroundColor:
                        selectedQuestion === index
                            ? colors.primary
                            : item.isCorrect
                                ? colors.successLight
                                : colors.errorLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: selectedQuestion === index ? 2 : 0,
                    borderColor: colors.accent,
                }}
            >
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontDisplay,
                        fontWeight: typography.weights.bold,
                        color:
                            selectedQuestion === index
                                ? colors.textInverse
                                : item.isCorrect
                                    ? colors.success
                                    : colors.error,
                    }}
                >
                    {index + 1}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderMcqOptions = () => {
        if (!currentAnswer.options) return null;
        return (
            <View style={{ gap: spacing.base, marginBottom: spacing.lg }}>
                {currentAnswer.options.map((option, idx) => {
                    const isCorrectOption = option.isCorrect;
                    const isUserChoice = currentAnswer.selectedOptionIndex === idx;

                    let backgroundColor = colors.surface;
                    let borderColor = colors.surfaceAlt;

                    if (isCorrectOption) {
                        backgroundColor = colors.successLight;
                        borderColor = colors.success;
                    } else if (isUserChoice && !isCorrectOption) {
                        backgroundColor = colors.errorLight;
                        borderColor = colors.error;
                    }

                    return (
                        <View
                            key={idx}
                            style={{
                                borderWidth: 2,
                                borderColor,
                                borderRadius: spacing.borderRadius.md,
                                padding: spacing.base,
                                backgroundColor,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    gap: spacing.base,
                                    alignItems: 'flex-start',
                                }}
                            >
                                {isCorrectOption ? (
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={20}
                                        color={colors.success}
                                    />
                                ) : isUserChoice ? (
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={20}
                                        color={colors.error}
                                    />
                                ) : (
                                    <View style={{ width: 20 }} />
                                )}
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: isCorrectOption
                                            ? colors.success
                                            : isUserChoice
                                                ? colors.error
                                                : colors.textPrimary,
                                        fontWeight: isCorrectOption
                                            ? typography.weights.semibold
                                            : typography.weights.normal,
                                        lineHeight: typography.scale.sm.fontSize * 1.4,
                                    }}
                                >
                                    {option.text}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderTrueFalseStatements = () => {
        if (!currentAnswer.statements) return null;
        return (
            <View style={{ gap: spacing.base, marginBottom: spacing.lg }}>
                {currentAnswer.statements.map((stmt, idx) => {
                    const userValue = stmt.selectedValue;
                    const correct = stmt.isCorrect;

                    let borderColor = colors.surfaceAlt;
                    let backgroundColor = colors.surface;
                    if (userValue !== undefined) {
                        if (correct) {
                            borderColor = colors.success;
                            backgroundColor = colors.successLight;
                        } else {
                            borderColor = colors.error;
                            backgroundColor = colors.errorLight;
                        }
                    }

                    return (
                        <View
                            key={idx}
                            style={{
                                borderWidth: 2,
                                borderColor,
                                borderRadius: spacing.borderRadius.md,
                                padding: spacing.base,
                                backgroundColor,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textPrimary,
                                    marginBottom: spacing.sm,
                                    lineHeight: typography.scale.sm.fontSize * 1.4,
                                }}
                            >
                                {stmt.text}
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    gap: spacing.md,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    সঠিক: {stmt.isTrue ? 'সত্য' : 'মিথ্যা'}
                                </Text>
                                {userValue !== undefined && (
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontWeight: typography.weights.semibold,
                                            color: correct ? colors.success : colors.error,
                                        }}
                                    >
                                        আপনার উত্তর: {userValue ? 'সত্য' : 'মিথ্যা'}
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <View style={{ flex: 1 }}>
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.base,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.surfaceAlt,
                    }}
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
                        আপনার উত্তর পর্যালোচনা
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: spacing.md,
                            marginTop: spacing.base,
                        }}
                    >
                        <Card style={{ flex: 1 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text
                                    style={{
                                        fontSize: typography.scale.lg.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.success,
                                    }}
                                >
                                    {correctCount}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    সঠিক
                                </Text>
                            </View>
                        </Card>
                        <Card style={{ flex: 1 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text
                                    style={{
                                        fontSize: typography.scale.lg.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.error,
                                    }}
                                >
                                    {wrongCount}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    ভুল
                                </Text>
                            </View>
                        </Card>
                        <Card style={{ flex: 1 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text
                                    style={{
                                        fontSize: typography.scale.lg.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.primary,
                                    }}
                                >
                                    {Math.round(result.percentageScore)}%
                                </Text>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    স্কোর
                                </Text>
                            </View>
                        </Card>
                    </View>
                </Animated.View>

                <View
                    style={{
                        paddingVertical: spacing.base,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.surfaceAlt,
                    }}
                >
                    <FlatList
                        data={answers}
                        renderItem={renderQuestionListItem}
                        keyExtractor={(item, idx) => `${item.questionId}-${idx}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: spacing.base,
                            gap: spacing.xs,
                        }}
                    />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.base,
                    }}
                >
                    <Animated.View entering={FadeInDown} key={selectedQuestion}>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                fontWeight: typography.weights.semibold,
                                color: colors.textSecondary,
                                marginBottom: spacing.base,
                            }}
                        >
                            প্রশ্ন {selectedQuestion + 1} / {totalQuestions} •{' '}
                            {currentAnswer.earnedMarks}/{currentAnswer.totalMarks} নম্বর
                        </Text>

                        <Text
                            style={{
                                fontSize: typography.scale.base.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: colors.textPrimary,
                                marginBottom: spacing.lg,
                                lineHeight: typography.scale.base.fontSize * 1.5,
                            }}
                        >
                            {currentAnswer.questionText}
                        </Text>

                        <View
                            style={{
                                paddingHorizontal: spacing.base,
                                paddingVertical: spacing.base,
                                backgroundColor: currentAnswer.isCorrect
                                    ? colors.successLight
                                    : colors.errorLight,
                                borderRadius: spacing.borderRadius.md,
                                marginBottom: spacing.lg,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: spacing.base,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={
                                        currentAnswer.isCorrect
                                            ? 'check-circle'
                                            : 'close-circle'
                                    }
                                    size={24}
                                    color={
                                        currentAnswer.isCorrect
                                            ? colors.success
                                            : colors.error
                                    }
                                />
                                <Text
                                    style={{
                                        fontSize: typography.scale.base.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: currentAnswer.isCorrect
                                            ? colors.success
                                            : colors.error,
                                    }}
                                >
                                    {currentAnswer.isCorrect ? 'সঠিক!' : 'ভুল'}
                                </Text>
                            </View>
                        </View>

                        {currentAnswer.questionPattern === 'mcq'
                            ? renderMcqOptions()
                            : renderTrueFalseStatements()}

                        {currentAnswer.explanation && (
                            <Card>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                            marginBottom: spacing.base,
                                        }}
                                    >
                                        ব্যাখ্যা
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                            lineHeight: typography.scale.sm.fontSize * 1.5,
                                        }}
                                    >
                                        {currentAnswer.explanation}
                                    </Text>
                                </View>
                            </Card>
                        )}
                    </Animated.View>

                    <View style={{ height: spacing.lg }} />
                </ScrollView>

                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={{
                        flexDirection: 'row',
                        gap: spacing.base,
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.base,
                        borderTopWidth: 1,
                        borderTopColor: colors.surfaceAlt,
                    }}
                >
                    <Button
                        label="পূর্ববর্তী"
                        variant="secondary"
                        size="large"
                        onPress={() =>
                            setSelectedQuestion((prev) => Math.max(0, prev - 1))
                        }
                        disabled={selectedQuestion === 0}
                        leftIcon="chevron-left"
                        style={{ flex: 1 }}
                    />
                    <Button
                        label="পরবর্তী"
                        variant="secondary"
                        size="large"
                        onPress={() =>
                            setSelectedQuestion((prev) =>
                                Math.min(totalQuestions - 1, prev + 1)
                            )
                        }
                        disabled={selectedQuestion === totalQuestions - 1}
                        rightIcon="chevron-right"
                        style={{ flex: 1 }}
                    />
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};
