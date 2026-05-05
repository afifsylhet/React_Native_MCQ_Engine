import React, { useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    useSharedValue,
    withSpring,
    useAnimatedStyle,
    useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useExamResult } from '../../hooks/useExam';
import { useHaptics } from '../../hooks/useHaptics';
import { ExamStackScreenProps } from '../../navigation/types';

type ExamResultScreenProps = ExamStackScreenProps<'ExamResult'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({ percentage, size = 200, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const animatedStrokeDashoffset = useSharedValue(circumference);

    useEffect(() => {
        animatedStrokeDashoffset.value = withSpring(strokeDashoffset, {
            damping: 20,
            stiffness: 100,
        });
    }, [percentage, circumference, strokeDashoffset, animatedStrokeDashoffset]);

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: animatedStrokeDashoffset.value,
        };
    });

    const progressColor = percentage >= 80 ? colors.success : percentage >= 60 ? colors.warning : colors.error;

    return (
        <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.surfaceAlt}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <AnimatedCircle
                    animatedProps={animatedProps}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </Svg>
            <View
                style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 56,
                        fontFamily: typography.fontDisplay,
                        fontWeight: typography.weights.bold,
                        color: progressColor,
                    }}
                >
                    {percentage}%
                </Text>
            </View>
        </View>
    );
};

const StatBar = ({ label, value, max, color, icon }: any) => {
    const percentage = (value / max) * 100;

    return (
        <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <MaterialCommunityIcons name={icon} size={18} color={color} />
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                        }}
                    >
                        {label}
                    </Text>
                </View>
                <Text
                    style={{
                        fontSize: typography.scale.base.fontSize,
                        fontFamily: typography.fontDisplay,
                        fontWeight: typography.weights.bold,
                        color: color,
                    }}
                >
                    {value} / {max}
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
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </View>
        </View>
    );
};

export const ExamResultScreen: React.FC<ExamResultScreenProps> = ({
    navigation,
    route,
}) => {
    const { attemptId } = route.params;
    const { data: result, isLoading, error } = useExamResult(attemptId);
    const { triggerSuccess } = useHaptics();

    const scaleValue = useSharedValue(0);

    // Use actual data from API, with fallbacks
    const percentageScore = Math.round(result?.percentageScore ?? 0);
    const totalMarks = result?.totalMarks ?? 0;
    const obtainedMarks = result?.obtainedMarks ?? 0;
    const correctAnswers = result?.correctAnswers ?? 0;
    const wrongAnswers = result?.wrongAnswers ?? 0;
    const unansweredQuestions = result?.unansweredQuestions ?? 0;
    const totalQuestions = result?.totalQuestions ?? 0;
    const isPassed = result?.isPassed ?? false;
    const timeTakenSeconds = result?.timeTakenSeconds ?? 0;

    // Accuracy = correct / attempted (excluding unanswered)
    const attempted = correctAnswers + wrongAnswers;
    const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;

    // Calculate time metrics
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeTakenSeconds / totalQuestions) : 0;

    // Get motivational message
    const getMotivationalMessage = () => {
        if (percentageScore >= 90) return '🌟 অসাধারণ! আপনি একজন তারকা!';
        if (percentageScore >= 80) return '🎉 দুর্দান্ত কাজ! এগিয়ে থাকুন!';
        if (percentageScore >= 70) return '💪 ভালো পারফরম্যান্স, অনুশীলন চালিয়ে যান!';
        if (percentageScore >= 60) return '📈 উন্নতি হচ্ছে, আরও মনোযোগ দিন!';
        return '🚀 পরবর্তীটি আরও ভালো হবে!';
    };

    // Animate score ring on mount
    useEffect(() => {
        if (result && !isLoading) {
            triggerSuccess();
            scaleValue.value = withSpring(1, { damping: 15, stiffness: 150 });
        }
    }, [result, isLoading, triggerSuccess, scaleValue]);

    const animatedScaleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scaleValue.value }],
        };
    });

    const handleRetakeExam = () => {
        navigation.navigate('ExamHub');
    };

    const handleReviewExam = () => {
        navigation.navigate('ExamReview', { attemptId });
    };

    const handleShareResult = async () => {
        try {
            await Share.share({
                message: `আমি বিডি নার্সিং প্রিপারেশণ MCQ পরীক্ষায় ${percentageScore}% স্কোর করেছি! 🎓\nসঠিক উত্তর: ${correctAnswers}/${totalQuestions}\nনির্ভুলতা: ${accuracy}%\nআপনিও চেষ্টা করে দেখুন!`,
                title: 'বিডি নার্সিং প্রিপারেশণ পরীক্ষার ফলাফল',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                        ফলাফল লোড হচ্ছে...
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // Show error state
    if (error) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.base }}>
                    <Text style={{ fontSize: 16, color: colors.error, marginBottom: spacing.base }}>
                        পরীক্ষার ফলাফল লোড করা যায়নি
                    </Text>
                    <Button label="ফিরে যান" onPress={() => navigation.navigate('ExamHub')} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Result Status */}
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        backgroundColor: isPassed ? colors.successLight : colors.errorLight,
                        borderBottomLeftRadius: spacing.borderRadius.lg,
                        borderBottomRightRadius: spacing.borderRadius.lg,
                    }}
                >
                    <View style={{ gap: spacing.md, alignItems: 'center' }}>
                        <Badge
                            variant={isPassed ? 'success' : 'danger'}
                            label={isPassed ? 'উত্তীর্ণ ✓' : 'অনুত্তীর্ণ'}
                        />
                        <Text
                            style={{
                                fontSize: typography.scale.base.fontSize,
                                fontFamily: typography.fontBody,
                                color: isPassed ? colors.success : colors.error,
                                textAlign: 'center',
                            }}
                        >
                            {getMotivationalMessage()}
                        </Text>
                    </View>
                </Animated.View>

                {/* Circular Progress Indicator */}
                <Animated.View
                    style={[
                        {
                            alignItems: 'center',
                            paddingVertical: spacing.lg,
                            justifyContent: 'center',
                        },
                        animatedScaleStyle,
                    ]}
                    entering={FadeInDown.delay(100)}
                >
                    <CircularProgress percentage={percentageScore} size={220} strokeWidth={10} />
                </Animated.View>

                {/* Score Summary Cards */}
                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={{
                        flexDirection: 'row',
                        gap: spacing.base,
                        paddingHorizontal: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    {/* Marks */}
                    <Card style={{ flex: 1 }}>
                        <View style={{ gap: spacing.xs, alignItems: 'center' }}>
                            <MaterialCommunityIcons name="star" size={24} color={colors.accent} />
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textPrimary,
                                }}
                            >
                                {obtainedMarks}
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    textAlign: 'center',
                                }}
                            >
                                মোট {totalMarks}
                            </Text>
                        </View>
                    </Card>

                    {/* Accuracy */}
                    <Card style={{ flex: 1 }}>
                        <View style={{ gap: spacing.xs, alignItems: 'center' }}>
                            <MaterialCommunityIcons name="target" size={24} color={colors.success} />
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textPrimary,
                                }}
                            >
                                {accuracy}%
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    textAlign: 'center',
                                }}
                            >
                                নির্ভুলতা
                            </Text>
                        </View>
                    </Card>

                    {/* Time */}
                    <Card style={{ flex: 1 }}>
                        <View style={{ gap: spacing.xs, alignItems: 'center' }}>
                            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.info} />
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textPrimary,
                                }}
                            >
                                {minutes}মি
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    textAlign: 'center',
                                }}
                            >
                                সময়
                            </Text>
                        </View>
                    </Card>
                </Animated.View>

                {/* Detailed Performance Breakdown */}
                <Animated.View
                    entering={FadeInDown.delay(300)}
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
                        পারফরম্যান্স বিশ্লেষণ
                    </Text>

                    <Card>
                        <View style={{ gap: spacing.lg }}>
                            <StatBar
                                label="সঠিক উত্তর"
                                value={correctAnswers}
                                max={totalQuestions}
                                color={colors.success}
                                icon="check-circle"
                            />
                            <StatBar
                                label="ভুল উত্তর"
                                value={wrongAnswers}
                                max={totalQuestions}
                                color={colors.error}
                                icon="close-circle"
                            />
                            <StatBar
                                label="অনুত্তরিত"
                                value={unansweredQuestions}
                                max={totalQuestions}
                                color={colors.primary}
                                icon="help-circle"
                            />
                        </View>
                    </Card>
                </Animated.View>

                {/* Time Analysis */}
                <Animated.View
                    entering={FadeInDown.delay(400)}
                    style={{
                        paddingHorizontal: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    <Card>
                        <View style={{ gap: spacing.md }}>
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textPrimary,
                                }}
                            >
                                সময় বিশ্লেষণ
                            </Text>

                            <View style={{ gap: spacing.md }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                        <MaterialCommunityIcons name="clock" size={18} color={colors.primary} />
                                        <Text style={{ fontSize: typography.scale.sm.fontSize, fontFamily: typography.fontBody, color: colors.textSecondary }}>
                                            মোট সময়
                                        </Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.base.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        {minutes}মি {seconds}সে
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                        <MaterialCommunityIcons name="speedometer" size={18} color={colors.accent} />
                                        <Text style={{ fontSize: typography.scale.sm.fontSize, fontFamily: typography.fontBody, color: colors.textSecondary }}>
                                            প্রশ্ন প্রতি গড় সময়
                                        </Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.base.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.accent,
                                        }}
                                    >
                                        {avgTimePerQuestion}সে
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Performance Rating */}
                <Animated.View
                    entering={FadeInDown.delay(500)}
                    style={{
                        paddingHorizontal: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    <Card>
                        <View style={{ gap: spacing.md, alignItems: 'center' }}>
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                }}
                            >
                                পারফরম্যান্স রেটিং
                            </Text>
                            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                                {[...Array(5)].map((_, i) => (
                                    <MaterialCommunityIcons
                                        key={i}
                                        name={i < Math.ceil(percentageScore / 20) ? 'star' : 'star-outline'}
                                        size={24}
                                        color={colors.accent}
                                    />
                                ))}
                            </View>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    textAlign: 'center',
                                }}
                            >
                                {percentageScore >= 90
                                    ? 'অসাধারণ পারফরম্যান্স'
                                    : percentageScore >= 70
                                        ? 'ভালো পারফরম্যান্স'
                                        : 'আরও অনুশীলন প্রয়োজন'}
                            </Text>
                        </View>
                    </Card>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                    entering={FadeInDown.delay(600)}
                    style={{
                        paddingHorizontal: spacing.base,
                        gap: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    <Button
                        label="উত্তর পর্যালোচনা করুন"
                        variant="secondary"
                        size="large"
                        onPress={handleReviewExam}
                        leftIcon="clipboard-list"
                    />

                    <Button
                        label="আবার পরীক্ষা দিন"
                        variant="primary"
                        size="large"
                        onPress={handleRetakeExam}
                        rightIcon="refresh"
                    />

                    <TouchableOpacity
                        onPress={handleShareResult}
                        style={{
                            paddingVertical: spacing.base,
                            flexDirection: 'row',
                            gap: spacing.md,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <MaterialCommunityIcons
                            name="share-variant"
                            size={20}
                            color={colors.primary}
                        />
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                fontWeight: typography.weights.semibold,
                                color: colors.primary,
                            }}
                        >
                            ফলাফল শেয়ার করুন
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </ScreenWrapper>
    );
};