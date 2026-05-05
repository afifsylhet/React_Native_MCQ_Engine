import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../ui/Card';
import { SkeletonCard, SkeletonText } from '../ui/SkeletonCard';
import { formatRelativeDate, formatPercentage } from '../../utils/formatters';
import { ExamHistoryItem } from '../../types/api.types';
import { Badge } from '../ui/Badge';

interface RecentActivityCardProps {
    items: ExamHistoryItem[];
    isLoading?: boolean;
    onViewAll: () => void;
    onItemPress?: (attemptId: string) => void;
    style?: ViewStyle;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
    items,
    isLoading = false,
    onViewAll,
    onItemPress,
    style,
}) => {
    if (isLoading) {
        return (
            <Card style={style}>
                <SkeletonText width="40%" height={20} style={{ marginBottom: spacing.md }} />
                <SkeletonCard count={3} height={60} style={{ marginBottom: -spacing.md }} />
            </Card>
        );
    }

    const displayItems = items.slice(0, 3);

    return (
        <Card style={style}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.md,
                    paddingBottom: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
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
                    সাম্প্রতিক কার্যকলাপ
                </Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.primary,
                            fontWeight: typography.weights.semibold,
                        }}
                    >
                        সব দেখুন
                    </Text>
                </TouchableOpacity>
            </View>

            {displayItems.length === 0 ? (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                    <MaterialCommunityIcons
                        name="clipboard-text-off"
                        size={40}
                        color={colors.textTertiary}
                        style={{ marginBottom: spacing.md }}
                    />
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            textAlign: 'center',
                        }}
                    >
                        এখনো কোনো পরীক্ষা দেওয়া হয়নি
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayItems}
                    renderItem={({ item }) => (
                        <RecentActivityRow
                            item={item}
                            onPress={() => onItemPress?.(item.attemptId)}
                        />
                    )}
                    keyExtractor={(item) => item.attemptId}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                height: 1,
                                backgroundColor: colors.border,
                                marginVertical: spacing.md,
                            }}
                        />
                    )}
                />
            )}
        </Card>
    );
};

const RecentActivityRow: React.FC<{
    item: ExamHistoryItem;
    onPress: () => void;
}> = ({ item, onPress }) => {
    const CATEGORY_LABEL: Record<string, string> = {
        past_exam: 'পূর্বের পরীক্ষা',
        model_test: 'মডেল টেস্ট',
        subject: 'বিষয়ভিত্তিক অনুশীলন',
        practice: 'অনুশীলন',
    };
    const categoryLabel = CATEGORY_LABEL[item.examCategory] || item.examCategory;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingVertical: spacing.sm,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            fontWeight: typography.weights.semibold,
                            color: colors.textPrimary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        {categoryLabel}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.sm,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textTertiary,
                            }}
                        >
                            {item.questionCount}টি প্রশ্ন
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textTertiary,
                            }}
                        >
                            •
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textTertiary,
                            }}
                        >
                            {formatRelativeDate(item.createdAt)}
                        </Text>
                    </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                    <Badge
                        label={formatPercentage(item.percentageScore)}
                        variant={item.isPassed ? 'success' : 'danger'}
                    />
                    <Text
                        style={{
                            fontSize: typography.scale.xs.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textTertiary,
                        }}
                    >
                        {item.isPassed ? '✓ উত্তীর্ণ' : '✗ অনুত্তীর্ণ'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
