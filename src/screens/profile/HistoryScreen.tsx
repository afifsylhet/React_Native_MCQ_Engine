import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useExamHistory } from '../../hooks/useExam';
import { ProfileStackScreenProps } from '../../navigation/types';
import { ExamHistoryItem } from '../../types/api.types';
import { formatDate } from '../../utils/formatters';

type HistoryScreenProps = ProfileStackScreenProps<'History'>;

const CATEGORY_LABEL: Record<string, string> = {
    past_exam: 'পূর্বের পরীক্ষা',
    model_test: 'মডেল টেস্ট',
    subject: 'বিষয়ভিত্তিক অনুশীলন',
    practice: 'অনুশীলন',
};

const formatCategory = (category: string): string =>
    CATEGORY_LABEL[category] ??
    category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
    const [filterBy, setFilterBy] = useState<'all' | 'passed' | 'failed'>('all');

    const {
        data,
        isLoading,
        isRefetching,
        refetch,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useExamHistory();

    const allItems: ExamHistoryItem[] = useMemo(
        () => data?.pages.flatMap((page: any) => page.items ?? []) ?? [],
        [data]
    );

    const filteredHistory = useMemo(() => {
        if (filterBy === 'passed') return allItems.filter((a) => a.isPassed);
        if (filterBy === 'failed') return allItems.filter((a) => !a.isPassed);
        return allItems;
    }, [allItems, filterBy]);

    const handleExamPress = (item: ExamHistoryItem) => {
        (navigation as any).navigate('Exams', {
            screen: 'ExamResult',
            params: { attemptId: item.attemptId },
        });
    };

    const renderExamCard = ({ item }: { item: ExamHistoryItem }) => {
        const timeMinutes = Math.round(item.timeTakenSeconds / 60);
        return (
            <Animated.View entering={FadeInDown}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleExamPress(item)}
                >
                    <Card style={{ marginBottom: spacing.base }}>
                        <View style={{ gap: spacing.md }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <View style={{ flex: 1, marginRight: spacing.md }}>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.base.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.textPrimary,
                                            marginBottom: spacing.xs,
                                        }}
                                    >
                                        {formatCategory(item.examCategory)}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        {formatDate(item.createdAt)}
                                    </Text>
                                </View>
                                <Badge
                                    variant={item.isPassed ? 'success' : 'error'}
                                    text={item.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                                    size="small"
                                />
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingVertical: spacing.md,
                                    borderTopWidth: 1,
                                    borderBottomWidth: 1,
                                    borderColor: colors.surfaceAlt,
                                }}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.lg.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: item.isPassed
                                                ? colors.success
                                                : colors.error,
                                        }}
                                    >
                                        {Math.round(item.percentageScore)}%
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        স্কোর
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.lg.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        {item.obtainedMarks}/{item.totalMarks}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        নম্বর
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.lg.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.accent,
                                        }}
                                    >
                                        {timeMinutes}মি
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        সময়
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    {item.questionCount}টি প্রশ্ন
                                </Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                        </View>
                    </Card>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    if (isLoading) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.lg, gap: spacing.base }}>
                    {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} height={160} />
                    ))}
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <View style={{ flex: 1 }}>
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
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
                        }}
                    >
                        পরীক্ষার ইতিহাস
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                    >
                        আপনার পূর্বের পরীক্ষার অ্যাটেম্পট পর্যালোচনা করুন
                    </Text>
                </Animated.View>

                <View
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.base,
                        flexDirection: 'row',
                        gap: spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.surfaceAlt,
                    }}
                >
                    {(['all', 'passed', 'failed'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setFilterBy(filter)}
                            style={{
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                backgroundColor:
                                    filterBy === filter
                                        ? colors.primary
                                        : colors.surfaceAlt,
                                borderRadius: spacing.borderRadius.lg,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color:
                                        filterBy === filter
                                            ? colors.textInverse
                                            : colors.textSecondary,
                                }}
                            >
                                {filter === 'all'
                                    ? 'সব পরীক্ষা'
                                    : filter === 'passed'
                                        ? 'উত্তীর্ণ'
                                        : 'অনুত্তীর্ণ'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {filteredHistory.length === 0 ? (
                    <View
                        style={{
                            flex: 1,
                            paddingHorizontal: spacing.base,
                            justifyContent: 'center',
                        }}
                    >
                        <EmptyState
                            icon="history"
                            title="এখনো কোনো পরীক্ষা নেই"
                            description={
                                filterBy === 'all'
                                    ? 'আপনি এখনো কোনো পরীক্ষা দেননি। এখনই অনুশীলন শুরু করুন!'
                                    : filterBy === 'passed'
                                        ? 'কোনো উত্তীর্ণ পরীক্ষা নেই। ফিল্টার পরিবর্তন করে দেখুন।'
                                        : 'কোনো অনুত্তীর্ণ পরীক্ষা নেই। ফিল্টার পরিবর্তন করে দেখুন।'
                            }
                        />
                    </View>
                ) : (
                    <FlatList
                        data={filteredHistory}
                        renderItem={renderExamCard}
                        keyExtractor={(item) => item.attemptId}
                        contentContainerStyle={{
                            paddingHorizontal: spacing.base,
                            paddingVertical: spacing.base,
                        }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor={colors.primary}
                            />
                        }
                        onEndReached={() => {
                            if (hasNextPage) fetchNextPage();
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <ActivityIndicator
                                    color={colors.primary}
                                    style={{ paddingVertical: spacing.base }}
                                />
                            ) : null
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};
