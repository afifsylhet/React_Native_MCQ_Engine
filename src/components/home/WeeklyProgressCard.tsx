import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import CircularProgressIndicatorRaw from 'react-native-circular-progress-indicator';
const CircularProgressIndicator = CircularProgressIndicatorRaw as any;
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../ui/Card';
import { SkeletonCard } from '../ui/SkeletonCard';

import { StyleProp } from 'react-native';

interface WeeklyProgressCardProps {
    weeklyScore: number;
    accuracy: number;
    rank: number;
    isLoading?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
    weeklyScore,
    accuracy,
    rank,
    isLoading = false,
    style,
}) => {
    const scorePercent = Math.min((weeklyScore / 500) * 100, 100);
    const normalizedAccuracy = Math.max(0, Math.min(100, Math.round(accuracy || 0)));
    const rankText = rank > 0 ? `#${rank}` : '--';
    const progressValue = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withTiming(scorePercent, { duration: 1200 });
    }, [scorePercent]);

    if (isLoading) {
        return <SkeletonCard height={200} style={style} />;
    }

    return (
        <Card style={[{ paddingHorizontal: spacing.base }, style]}>
            <View
                style={{
                    alignItems: 'center',
                    paddingVertical: spacing.lg,
                }}
            >
                <CircularProgressIndicator
                    value={scorePercent}
                    radius={60}
                    strokeWidth={8}
                    progressValueColor={colors.textPrimary}
                    activeStrokeColor={colors.primary}
                    inactiveStrokeColor={colors.primaryLight}
                    duration={1200}
                >
                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                fontSize: typography.scale['2xl'].fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: colors.primary,
                            }}
                        >
                            {Math.round(scorePercent)}%
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textSecondary,
                                marginTop: spacing.xs,
                            }}
                        >
                            সাপ্তাহিক স্কোর
                        </Text>
                    </View>
                </CircularProgressIndicator>
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    paddingVertical: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                }}
            >
                <View style={{ alignItems: 'center' }}>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        স্কোর
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.primary,
                        }}
                    >
                        {weeklyScore}
                    </Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        র‍্যাঙ্ক
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.primary,
                        }}
                    >
                        {rankText}
                    </Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        নির্ভুলতা
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.success,
                        }}
                    >
                        {normalizedAccuracy}%
                    </Text>
                </View>
            </View>
        </Card>
    );
};
