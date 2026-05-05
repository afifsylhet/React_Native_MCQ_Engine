import React from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ProfileStackScreenProps } from '../../navigation/types';
import { formatDate } from '../../utils/formatters';

type HistoryDetailScreenProps = ProfileStackScreenProps<'HistoryDetail'>;

export const HistoryDetailScreen: React.FC<HistoryDetailScreenProps> = ({
    navigation,
    route,
}) => {
    const { examId, examTitle, score, totalQuestions, date } = route.params;

    // Mock detailed exam data
    const examDetail = {
        examId,
        examTitle,
        score,
        totalQuestions,
        correctAnswers: Math.round((score / 100) * totalQuestions),
        wrongAnswers: totalQuestions - Math.round((score / 100) * totalQuestions),
        date,
        difficulty: 'medium' as const,
        timeSpent: 105,
        category: 'পূর্বের পরীক্ষা',
        subjectWiseScores: [
            { subject: 'অ্যানাটমি', score: 82, total: 15 },
            { subject: 'ফিজিওলজি', score: 75, total: 15 },
            { subject: 'প্যাথলজি', score: 68, total: 15 },
            { subject: 'ফার্মাকোলজি', score: 85, total: 15 },
        ],
    };

    const isPassed = score >= 60;
    const accuracy = score;

    const handleReview = () => {
        // Navigate to review screen with this exam's data
        (navigation as any).navigate('Exams', {
            screen: 'ExamReview',
            params: { attemptId: examId },
        });
    };

    const handleRetake = () => {
        (navigation as any).navigate('Exams', {
            screen: 'ExamHub',
        });
    };

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: spacing.base,
                        paddingTop: spacing.lg,
                        paddingBottom: spacing.lg,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginBottom: spacing.md }}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={24}
                            color={colors.textInverse}
                        />
                    </TouchableOpacity>

                    <Text
                        style={{
                            fontSize: typography.scale['2xl'].fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textInverse,
                            marginBottom: spacing.base,
                        }}
                    >
                        {examTitle}
                    </Text>

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
                                    color: 'rgba(255,255,255,0.7)',
                                    marginBottom: spacing.md,
                                }}
                            >
                                {formatDate(date)}
                            </Text>
                        </View>

                        <Badge
                            variant={isPassed ? 'success' : 'error'}
                            text={isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                            size="small"
                        />
                    </View>
                </Animated.View>

                {/* Score Section */}
                <Animated.View
                    entering={FadeInDown.delay(100)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    <Card
                        style={{
                            backgroundColor: isPassed
                                ? colors.successLight
                                : colors.errorLight,
                            borderLeftWidth: 4,
                            borderLeftColor: isPassed ? colors.success : colors.error,
                        }}
                    >
                        <View style={{ alignItems: 'center', gap: spacing.md }}>
                            <Text
                                style={{
                                    fontSize: typography.scale['3xl'].fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: isPassed ? colors.success : colors.error,
                                }}
                            >
                                {score}%
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: isPassed ? colors.success : colors.error,
                                }}
                            >
                                {isPassed ? '✓ দারুণ পারফরম্যান্স!' : '✗ অনুশীলন চালিয়ে যান'}
                            </Text>
                        </View>
                    </Card>
                </Animated.View>

                {/* Performance Summary */}
                <Animated.View
                    entering={FadeInDown.delay(150)}
                    style={{
                        paddingHorizontal: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    <Card>
                        <View style={{ gap: spacing.md }}>
                            {/* Correct Answers */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: spacing.md,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.surfaceAlt,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color={colors.success}
                                    />
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            সঠিক উত্তর
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.base.fontSize,
                                                fontFamily: typography.fontDisplay,
                                                fontWeight: typography.weights.bold,
                                                color: colors.success,
                                                marginTop: spacing.xs,
                                            }}
                                        >
                                            {examDetail.correctAnswers}
                                        </Text>
                                    </View>
                                </View>
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    / {totalQuestions}
                                </Text>
                            </View>

                            {/* Wrong Answers */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: spacing.md,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.surfaceAlt,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={24}
                                        color={colors.error}
                                    />
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            ভুল উত্তর
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.base.fontSize,
                                                fontFamily: typography.fontDisplay,
                                                fontWeight: typography.weights.bold,
                                                color: colors.error,
                                                marginTop: spacing.xs,
                                            }}
                                        >
                                            {examDetail.wrongAnswers}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Time Spent */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: spacing.md,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={24}
                                    color={colors.accent}
                                />
                                <View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        সময় নেওয়া হয়েছে
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.base.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.accent,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        {examDetail.timeSpent} মিনিট
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Subject-wise Performance */}
                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={{
                        paddingHorizontal: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.md,
                        }}
                    >
                        বিষয়ভিত্তিক পারফরম্যান্স
                    </Text>

                    <View style={{ gap: spacing.md }}>
                        {examDetail.subjectWiseScores.map((subject) => {
                            const subjectPercentage =
                                (subject.score / subject.total) * 100;

                            return (
                                <Card key={subject.subject}>
                                    <View style={{ gap: spacing.md }}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                {subject.subject}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontDisplay,
                                                    fontWeight: typography.weights.bold,
                                                    color: colors.primary,
                                                }}
                                            >
                                                {subject.score}/{subject.total}
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                height: 6,
                                                backgroundColor: colors.surfaceAlt,
                                                borderRadius: spacing.borderRadius.full,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: '100%',
                                                    width: `${subjectPercentage}%`,
                                                    backgroundColor: colors.primary,
                                                }}
                                            />
                                        </View>

                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            {Math.round(subjectPercentage)}% সঠিক
                                        </Text>
                                    </View>
                                </Card>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        gap: spacing.base,
                    }}
                >
                    <Button
                        label="উত্তর পর্যালোচনা করুন"
                        variant="secondary"
                        size="large"
                        onPress={handleReview}
                        leftIcon="clipboard-list"
                    />

                    <Button
                        label="আবার পরীক্ষা দিন"
                        variant="primary"
                        size="large"
                        onPress={handleRetake}
                        rightIcon="refresh"
                    />
                </Animated.View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
