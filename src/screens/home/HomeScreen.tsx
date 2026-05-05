import React from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, ZoomIn, withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GreetingHeader } from '../../components/home/GreetingHeader';
import { WeeklyProgressCard } from '../../components/home/WeeklyProgressCard';
import { QuickActionGrid } from '../../components/home/QuickActionGrid';
import { RecentActivityCard } from '../../components/home/RecentActivityCard';
import { NoticeBoardCard } from '../../components/home/NoticeBoardCard';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useMyRank } from '../../hooks/useLeaderboard';
import { useExamHistory } from '../../hooks/useExam';
import { useNotifications } from '../../hooks/useNotifications';
import { queryKeys, queryClient } from '../../api/queryClient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { HomeStackScreenProps } from '../../navigation/types';

type HomeScreenProps = HomeStackScreenProps<'HomeMain'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const { profile, stats, isLoading: profileLoading } = useProfile();
    const { data: myRank, isLoading: rankLoading } = useMyRank(!isAdmin);
    const { data: historyData, isLoading: historyLoading } = useExamHistory({
        page: 1,
        limit: 3,
    });
    const { unreadCount } = useNotifications();
    const [refreshing, setRefreshing] = React.useState(false);

    // Animation for button pulse
    const buttonScale = useSharedValue(1);
    React.useEffect(() => {
        buttonScale.value = withRepeat(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [buttonScale]);

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: buttonScale.value }],
        };
    });

    const displayName = (profile?.fullName || user?.fullName || '').trim();

    const recentItems = historyData?.pages[0]?.items || [];
    const weeklyScore = Number(stats?.weeklyScore ?? myRank?.weeklyScore ?? 0);
    const accuracy = Number(
        myRank?.accuracy ?? stats?.accuracyPercentage ?? stats?.averageScore ?? 0
    );
    const rank = Number(myRank?.rank ?? 0);
    const rankText = rank > 0 ? `#${rank}` : '--';

    const handleRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: queryKeys.user.profile }),
                queryClient.refetchQueries({ queryKey: queryKeys.user.stats }),
                queryClient.refetchQueries({ queryKey: queryKeys.leaderboard.myRank }),
                queryClient.refetchQueries({ queryKey: queryKeys.exam.history(1) }),
            ]);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const quickActions = [
        {
            id: 'past-exam',
            icon: 'file-document-multiple',
            label: 'পূর্বের পরীক্ষা',
            color: colors.primary,
            onPress: () =>
                navigation.navigate('Exams', {
                    screen: 'ExamHub',
                }),
        },
        {
            id: 'model-test',
            icon: 'clipboard-text',
            label: 'মডেল টেস্ট',
            color: colors.primary,
            onPress: () =>
                navigation.navigate('Exams', {
                    screen: 'ExamHub',
                }),
        },
        {
            id: 'practice',
            icon: 'bookshelf',
            label: 'অনুশীলন',
            color: colors.primary,
            onPress: () =>
                navigation.navigate('Exams', {
                    screen: 'ExamHub',
                }),
        },
        {
            id: 'history',
            icon: 'history',
            label: 'আমার ইতিহাস',
            color: colors.primary,
            onPress: () =>
                navigation.navigate('Profile', {
                    screen: 'History',
                    initial: false,
                }),
        },
    ];

    if (!user) {
        return (
            <ScreenWrapper>
                <Text>লোড হচ্ছে...</Text>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable={false} backgroundColor={colors.background}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <Animated.View entering={FadeInDown.delay(0)}>
                    <GreetingHeader
                        firstName={displayName}
                        studentType={user.studentType}
                        unreadNotifications={unreadCount}
                        onNotificationPress={() =>
                            navigation.navigate('Home', {
                                screen: 'Notifications',
                            })
                        }
                        style={styles.header}
                    />
                </Animated.View>

                <View style={styles.contentWrap}>
                    <Animated.View
                        style={styles.focusCard}
                        entering={FadeInDown.delay(100)}
                    >
                        <View style={styles.focusTitleRow}>
                            <Animated.View
                                style={styles.focusIconWrap}
                                entering={ZoomIn.delay(150)}
                            >
                                <MaterialCommunityIcons
                                    name="medical-bag"
                                    size={18}
                                    color={colors.primary}
                                />
                            </Animated.View>
                            <Text style={styles.focusTitle}>আজকের লক্ষ্য</Text>
                        </View>

                        <Text style={styles.focusSubtitle}>
                            একটি ছোট অনুশীলন সেশন করুন এবং এই সপ্তাহের গতি ধরে রাখুন।
                        </Text>

                        <View style={styles.focusStatsRow}>
                            <View style={styles.focusStatItem}>
                                <Text style={styles.focusStatValue}>{stats?.weeklyScore || 0}</Text>
                                <Text style={styles.focusStatLabel}>স্কোর</Text>
                            </View>
                            <View style={styles.focusStatDivider} />
                            <View style={styles.focusStatItem}>
                                <Text style={styles.focusStatValue}>{rankText}</Text>
                                <Text style={styles.focusStatLabel}>র‍্যাঙ্ক</Text>
                            </View>
                            <View style={styles.focusStatDivider} />
                            <View style={styles.focusStatItem}>
                                <Text style={styles.focusStatValue}>{accuracy}%</Text>
                                <Text style={styles.focusStatLabel}>নির্ভুলতা</Text>
                            </View>
                        </View>

                        <Animated.View style={buttonAnimatedStyle}>
                            <TouchableOpacity
                                style={[styles.focusButton, styles.highlightedButton]}
                                activeOpacity={0.85}
                                onPress={() =>
                                    navigation.navigate('Exams', {
                                        screen: 'ExamHub',
                                    })
                                }
                            >
                                <Text style={styles.focusButtonText}>অনুশীলন শুরু করুন</Text>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={18}
                                    color={colors.textInverse}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    <Animated.View
                        style={styles.sectionHeader}
                        entering={FadeInDown.delay(200)}
                    >
                        <Text style={styles.sectionTitle}>দ্রুত অ্যাকশন</Text>
                        <Text style={styles.sectionHint}>যা প্রয়োজন সরাসরি সেখানে যান</Text>
                    </Animated.View>

                    <QuickActionGrid items={quickActions} style={styles.quickActionGrid} />

                    <Animated.View
                        style={styles.sectionHeader}
                        entering={FadeInDown.delay(300)}
                    >
                        <Text style={styles.sectionTitle}>পারফরম্যান্স</Text>
                        <Text style={styles.sectionHint}>এই সপ্তাহের সংক্ষিপ্ত চিত্র</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(350)}>
                        <WeeklyProgressCard
                            weeklyScore={weeklyScore}
                            accuracy={accuracy}
                            rank={rank}
                            isLoading={profileLoading || rankLoading}
                            style={styles.progressCard}
                        />
                    </Animated.View>

                    {false && (
                        <View
                            style={{
                                backgroundColor: colors.accentLight,
                                borderRadius: 12,
                                padding: spacing.base,
                                marginBottom: spacing.lg,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: colors.accent,
                                }}
                            >
                                🔓 সব প্রশ্ন আনলক করুন
                            </Text>
                        </View>
                    )}

                    <Animated.View
                        style={styles.sectionHeader}
                        entering={FadeInDown.delay(400)}
                    >
                        <Text style={styles.sectionTitle}>নোটিস বোর্ড</Text>
                        <Text style={styles.sectionHint}>টিমের পক্ষ থেকে আপডেট</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(450)}>
                        <NoticeBoardCard style={styles.noticeCard} />
                    </Animated.View>

                    <Animated.View
                        style={styles.sectionHeader}
                        entering={FadeInDown.delay(500)}
                    >
                        <Text style={styles.sectionTitle}>সাম্প্রতিক কার্যকলাপ</Text>
                        <Text style={styles.sectionHint}>সম্প্রতি সম্পন্ন পরীক্ষাগুলো</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(550)}>
                        <RecentActivityCard
                            items={recentItems}
                            isLoading={historyLoading}
                            onViewAll={() =>
                                navigation.navigate('Profile', {
                                    screen: 'History',
                                    initial: false,
                                })
                            }
                            onItemPress={(attemptId) =>
                                navigation.navigate('Profile', {
                                    screen: 'HistoryDetail',
                                    params: {
                                        examId: attemptId,
                                        examTitle: 'পরীক্ষা',
                                        score: 0,
                                        totalQuestions: 0,
                                        date: new Date().toISOString(),
                                    },
                                    initial: false,
                                })
                            }
                            style={styles.recentCard}
                        />
                    </Animated.View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    header: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
    },
    contentWrap: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.lg,
    },
    focusCard: {
        backgroundColor: colors.surface,
        borderRadius: spacing.borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.base,
        marginBottom: spacing.xl,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    focusTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    focusIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusTitle: {
        fontSize: typography.scale.base.fontSize,
        fontFamily: 'Sora_600SemiBold',
        color: colors.textPrimary,
    },
    focusSubtitle: {
        fontSize: typography.scale.sm.fontSize,
        lineHeight: typography.scale.sm.lineHeight,
        color: colors.textSecondary,
        fontFamily: 'Nunito_400Regular',
        marginBottom: spacing.base,
    },
    focusStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceAlt,
        borderRadius: spacing.borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.base,
    },
    focusStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    focusStatValue: {
        fontSize: typography.scale.base.fontSize,
        fontFamily: 'Sora_700Bold',
        color: colors.primary,
        marginBottom: 2,
    },
    focusStatLabel: {
        fontSize: typography.scale.xs.fontSize,
        color: colors.textSecondary,
        fontFamily: 'Nunito_600SemiBold',
    },
    focusStatDivider: {
        width: 1,
        height: 26,
        backgroundColor: colors.border,
    },
    focusButton: {
        backgroundColor: colors.primary,
        borderRadius: spacing.borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    highlightedButton: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    focusButtonText: {
        color: colors.textInverse,
        fontFamily: 'Nunito_700Bold',
        fontSize: typography.scale.sm.fontSize,
    },
    sectionHeader: {
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.scale.base.fontSize,
        fontFamily: 'Sora_600SemiBold',
        color: colors.textPrimary,
    },
    sectionHint: {
        marginTop: 2,
        fontSize: typography.scale.xs.fontSize,
        fontFamily: 'Nunito_400Regular',
        color: colors.textSecondary,
    },
    quickActionGrid: {
        marginBottom: spacing.md,
    },
    progressCard: {
        marginBottom: spacing.lg,
    },
    recentCard: {
        marginBottom: spacing.base,
    },
    noticeCard: {
        marginBottom: spacing.lg,
    },
});
