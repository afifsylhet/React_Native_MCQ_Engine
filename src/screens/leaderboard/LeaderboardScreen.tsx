import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLeaderboard, useMyRank } from '../../hooks/useLeaderboard';
import { useAuth } from '../../hooks/useAuth';
import { LeaderboardEntry } from '../../types/api.types';

const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getTopThreeColor = (rank: number): string => {
    switch (rank) {
        case 1:
            return colors.accent;
        case 2:
            return '#C0C0C0';
        case 3:
            return '#CD7F32';
        default:
            return colors.primary;
    }
};

const getMedal = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
};

export const LeaderboardScreen: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [selectedExamType, setSelectedExamType] = useState<'admission' | 'license'>(
        (user?.examType as 'admission' | 'license') || 'admission'
    );
    const currentUserId = user?._id || user?.id;

    const {
        data: leaderboard,
        isLoading,
        isRefetching,
        refetch,
    } = useLeaderboard({
        examType: isAdmin ? selectedExamType : undefined,
    });
    const { data: myRank } = useMyRank(!isAdmin);

    const items: LeaderboardEntry[] = leaderboard?.items ?? [];
    const topThree = items.slice(0, 3);
    const restUsers = items.slice(3);

    if (isLoading) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View style={{ paddingHorizontal: spacing.base, gap: spacing.base }}>
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonCard key={i} height={100} />
                    ))}
                </View>
            </ScreenWrapper>
        );
    }

    const renderTopThreeCard = (entry: LeaderboardEntry) => {
        const isFirst = entry.rank === 1;
        const cardHeight = isFirst ? 180 : 150;

        return (
            <Animated.View
                key={entry.userId}
                entering={FadeInDown.delay(entry.rank * 100)}
                style={{ flex: 1, alignItems: 'center' }}
            >
                <Card
                    style={{
                        width: '100%',
                        height: cardHeight,
                        backgroundColor: getTopThreeColor(entry.rank),
                        opacity: 0.1,
                        marginBottom: spacing.lg,
                    }}
                />
                <View
                    style={{
                        position: 'absolute',
                        alignItems: 'center',
                        width: '100%',
                        top: isFirst ? spacing.base : spacing.lg,
                    }}
                >
                    <Text style={{ fontSize: 48, marginBottom: spacing.md }}>
                        {getMedal(entry.rank)}
                    </Text>
                    <View
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            backgroundColor: getTopThreeColor(entry.rank),
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: spacing.md,
                            borderWidth: 3,
                            borderColor: colors.surface,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: typography.scale.lg.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: colors.textInverse,
                            }}
                        >
                            {getInitials(entry.userName)}
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.xs,
                            textAlign: 'center',
                        }}
                        numberOfLines={1}
                    >
                        {entry.userName}
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: getTopThreeColor(entry.rank),
                        }}
                    >
                        {entry.score} পয়েন্ট
                    </Text>
                </View>
            </Animated.View>
        );
    };

    const renderLeaderboardItem = ({
        item,
        index,
    }: {
        item: LeaderboardEntry;
        index: number;
    }) => {
        const isCurrentUser = item.userId === currentUserId;
        return (
            <Animated.View entering={FadeInDown.delay(300 + index * 50)}>
                <Card
                    style={{
                        marginBottom: spacing.base,
                        backgroundColor: isCurrentUser
                            ? colors.primaryLight
                            : colors.surface,
                        borderLeftWidth: isCurrentUser ? 4 : 0,
                        borderLeftColor: isCurrentUser
                            ? colors.primary
                            : 'transparent',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.md,
                                flex: 1,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.surfaceAlt,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.textPrimary,
                                    }}
                                >
                                    #{item.rank}
                                </Text>
                            </View>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.textInverse,
                                    }}
                                >
                                    {getInitials(item.userName)}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                            flexShrink: 1,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {item.userName}
                                    </Text>
                                    {isCurrentUser && (
                                        <Badge variant="primary" text="আপনি" size="small" />
                                    )}
                                </View>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                        marginTop: spacing.xs,
                                    }}
                                >
                                    {item.examsTaken}টি পরীক্ষা • {item.accuracy}% নির্ভুলতা
                                </Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.primary,
                                }}
                            >
                                {item.score}
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    marginTop: spacing.xs,
                                }}
                            >
                                পয়েন্ট
                            </Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.primary}
                    />
                }
            >
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale['2xl'].fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                        }}
                    >
                        সাপ্তাহিক লিডারবোর্ড
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                    >
                        {isAdmin
                            ? `${selectedExamType === 'admission' ? 'Admission' : 'License'} ক্যাটাগরির র‍্যাঙ্কিং`
                            : 'এই সপ্তাহের সেরা পারফর্মাররা'}
                    </Text>

                    {isAdmin && (
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: spacing.sm,
                                marginTop: spacing.md,
                            }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => setSelectedExamType('admission')}
                                style={{
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.sm,
                                    borderRadius: spacing.borderRadius.lg,
                                    backgroundColor:
                                        selectedExamType === 'admission'
                                            ? colors.primary
                                            : colors.surfaceAlt,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: typography.weights.semibold,
                                        color:
                                            selectedExamType === 'admission'
                                                ? colors.textInverse
                                                : colors.textSecondary,
                                    }}
                                >
                                    Admission
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => setSelectedExamType('license')}
                                style={{
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.sm,
                                    borderRadius: spacing.borderRadius.lg,
                                    backgroundColor:
                                        selectedExamType === 'license'
                                            ? colors.primary
                                            : colors.surfaceAlt,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: typography.weights.semibold,
                                        color:
                                            selectedExamType === 'license'
                                                ? colors.textInverse
                                                : colors.textSecondary,
                                    }}
                                >
                                    License
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>

                {!isAdmin && myRank && (
                    <Animated.View
                        entering={FadeInDown.delay(50)}
                        style={{
                            paddingHorizontal: spacing.base,
                            marginBottom: spacing.lg,
                        }}
                    >
                        <Card
                            style={{
                                backgroundColor: colors.primaryLight,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.primary,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        আপনার র‍্যাঙ্ক
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xl.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        #{myRank.rank}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        {myRank.comparedTo} জনের মধ্যে শীর্ষ {myRank.percentile}%
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        সাপ্তাহিক স্কোর
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xl.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {myRank.weeklyScore}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.success,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        {myRank.examsTaken}টি পরীক্ষা • {myRank.accuracy}% নির্ভুলতা
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </Animated.View>
                )}

                {items.length === 0 ? (
                    <View style={{ paddingHorizontal: spacing.base }}>
                        <EmptyState
                            icon="trophy-outline"
                            title="এখনো কোনো র‍্যাঙ্কিং নেই"
                            description="লিডারবোর্ডে উঠতে পরীক্ষা দিন"
                        />
                    </View>
                ) : (
                    <>
                        {topThree.length > 0 && (
                            <View
                                style={{
                                    paddingHorizontal: spacing.base,
                                    paddingBottom: spacing.lg,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'flex-end',
                                        gap: spacing.md,
                                    }}
                                >
                                    {topThree.length > 1 && renderTopThreeCard(topThree[1])}
                                    {renderTopThreeCard(topThree[0])}
                                    {topThree.length > 2 && renderTopThreeCard(topThree[2])}
                                </View>
                            </View>
                        )}

                        <View
                            style={{
                                height: 1,
                                backgroundColor: colors.surfaceAlt,
                                marginHorizontal: spacing.base,
                                marginVertical: spacing.lg,
                            }}
                        />

                        <View
                            style={{
                                paddingHorizontal: spacing.base,
                                paddingBottom: spacing.lg,
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
                                সব র‍্যাঙ্কিং
                            </Text>
                            <FlatList
                                data={restUsers}
                                renderItem={renderLeaderboardItem}
                                keyExtractor={(item) => item.userId}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <EmptyState
                                        icon="account-multiple"
                                        title="এখনো শুধু শীর্ষ ৩ জন"
                                        description="আরও ব্যবহারকারী পরীক্ষা দিলে র‍্যাঙ্কিং দেখা যাবে"
                                    />
                                }
                            />
                        </View>
                    </>
                )}

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
