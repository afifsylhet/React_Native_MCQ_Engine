import React, { useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useMySubscription } from '../../hooks/useSubscription';
import { ProfileStackScreenProps } from '../../navigation/types';
import { formatDate, formatNumber } from '../../utils/formatters';

const PLAN_DISPLAY_LABEL: Record<string, string> = {
    quarterly: '৪ মাস',
    half_yearly: '৪ মাস',
};

const daysUntil = (iso?: string) => {
    if (!iso) return 0;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

type ProfileScreenProps = ProfileStackScreenProps<'MyProfile'>;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { profile, stats, isLoading } = useProfile();
    const { data: mySubscription } = useMySubscription();
    const sub: any = mySubscription;
    const hasActiveSub = !!sub && (sub.status === 'approved' || sub.isActive === true);
    const isPending = !!sub && sub.status === 'pending';

    if (isLoading || !profile) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View style={{ paddingHorizontal: spacing.base, gap: spacing.base }}>
                    <SkeletonCard height={120} />
                    <SkeletonCard height={80} />
                    <SkeletonCard height={200} />
                </View>
            </ScreenWrapper>
        );
    }

    // Safely access profile properties with fallbacks
    const profileData = {
        fullName: profile.fullName ?? 'User',
        examType: profile.examType ?? '',
        studentType: profile.studentType ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        email: profile.email ?? '',
        examsTaken: stats?.totalExamsTaken ?? 0,
        averageScore: stats?.averageScore ?? 0,
        bestScore: stats?.bestScore ?? 0,
        currentStreak: stats?.streakDays ?? 0,
        longestStreak: stats?.streakDays ?? 0,
    };

    const studentLevel = profileData.examsTaken === 0 ? 'নবীন' : profileData.averageScore >= 80 ? 'দক্ষ' : 'মধ্যবর্তী';
    const achievementPercentage = Math.min(
        (profileData.examsTaken / 50) * 100,
        100
    );

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: spacing.base,
                        paddingTop: spacing.lg,
                        paddingBottom: spacing.lg,
                    }}
                >
                    {/* Profile Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.md,
                            marginBottom: spacing.lg,
                        }}
                    >
                        {/* Avatar */}
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: colors.accent,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 40,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textInverse,
                                }}
                            >
                                {profileData.fullName?.charAt(0) ?? 'U'}
                            </Text>
                        </View>

                        {/* User Info */}
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: typography.scale.lg.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textInverse,
                                    marginBottom: spacing.xs,
                                }}
                            >
                                {profileData.fullName}
                            </Text>
                            {(profileData.examType || profileData.studentType) && (
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: 'rgba(255,255,255,0.7)',
                                        marginBottom: spacing.xs,
                                    }}
                                >
                                    {profileData.examType && profileData.studentType
                                        ? `${profileData.examType} · ${profileData.studentType}`
                                        : profileData.examType || profileData.studentType}
                                </Text>
                            )}
                            {profileData.phoneNumber && (
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: 'rgba(255,255,255,0.7)',
                                        marginBottom: spacing.xs,
                                    }}
                                >
                                    {profileData.phoneNumber}
                                </Text>
                            )}
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginBottom: spacing.xs,
                                }}
                            >
                                {profileData.email}
                            </Text>
                            <Badge
                                variant="primary"
                                text={studentLevel}
                                size="small"
                            />
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: spacing.md,
                            paddingBottom: spacing.base,
                        }}
                    >
                        {/* Exams Taken */}
                        <View
                            style={{
                                flex: 1,
                                paddingHorizontal: spacing.base,
                                paddingVertical: spacing.md,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: spacing.borderRadius.md,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textInverse,
                                }}
                            >
                                {formatNumber(profileData.examsTaken)}
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: spacing.xs,
                                }}
                            >
                                পরীক্ষা
                            </Text>
                        </View>

                        {/* Avg Score */}
                        <View
                            style={{
                                flex: 1,
                                paddingHorizontal: spacing.base,
                                paddingVertical: spacing.md,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: spacing.borderRadius.md,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textInverse,
                                }}
                            >
                                {profileData.averageScore}%
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: spacing.xs,
                                }}
                            >
                                গড় স্কোর
                            </Text>
                        </View>

                        {/* Best Score */}
                        <View
                            style={{
                                flex: 1,
                                paddingHorizontal: spacing.base,
                                paddingVertical: spacing.md,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: spacing.borderRadius.md,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.base.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textInverse,
                                }}
                            >
                                {profileData.bestScore}%
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: spacing.xs,
                                }}
                            >
                                সেরা স্কোর
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Performance Section */}
                <Animated.View
                    entering={FadeInDown.delay(100)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
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
                        পারফরম্যান্স
                    </Text>

                    <Card>
                        <View style={{ gap: spacing.md }}>
                            {/* Accuracy */}
                            <View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: spacing.md,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        সামগ্রিক নির্ভুলতা
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.base.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        {profileData.averageScore}%
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        height: 8,
                                        backgroundColor: colors.surfaceAlt,
                                        borderRadius: spacing.borderRadius.full,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <View
                                        style={{
                                            height: '100%',
                                            width: `${profileData.averageScore}%`,
                                            backgroundColor: colors.primary,
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Study Streak */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: spacing.md,
                                    borderTopWidth: 1,
                                    borderTopColor: colors.surfaceAlt,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="fire"
                                        size={24}
                                        color={colors.accent}
                                    />
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.sm.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            বর্তমান স্ট্রিক
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
                                            {profileData.currentStreak ?? 0} দিন
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.xs,
                                        backgroundColor: colors.accentLight,
                                        borderRadius: spacing.borderRadius.md,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.accent,
                                        }}
                                    >
                                        সেরা: {profileData.longestStreak ?? 0} দিন
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Subscription Status */}
                <Animated.View
                    entering={FadeInDown.delay(150)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingTop: spacing.md,
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
                        আমার সাবস্ক্রিপশন
                    </Text>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Subscription' as never)}
                        activeOpacity={0.85}
                    >
                        <Card
                            style={{
                                borderLeftWidth: 4,
                                borderLeftColor: hasActiveSub
                                    ? colors.success
                                    : isPending
                                        ? colors.warning
                                        : colors.textTertiary,
                                backgroundColor: hasActiveSub
                                    ? colors.successLight || colors.surface
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
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        backgroundColor: hasActiveSub
                                            ? colors.success
                                            : isPending
                                                ? colors.warning
                                                : colors.surfaceAlt,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            hasActiveSub
                                                ? 'check-decagram'
                                                : isPending
                                                    ? 'clock-outline'
                                                    : 'lock-outline'
                                        }
                                        size={24}
                                        color={
                                            hasActiveSub || isPending
                                                ? colors.textInverse
                                                : colors.textTertiary
                                        }
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    {hasActiveSub ? (
                                        <>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.base.fontSize,
                                                    fontFamily: typography.fontDisplay,
                                                    fontWeight: typography.weights.bold,
                                                    color: colors.success,
                                                }}
                                            >
                                                ✓ সাবস্ক্রিপশন সক্রিয়
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textPrimary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                {PLAN_DISPLAY_LABEL[sub?.plan] || sub?.plan}{' '}
                                                প্ল্যান · {sub?.currency === 'BDT' ? '৳' : '₹'}
                                                {sub?.price}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                মেয়াদ শেষ {formatDate(sub?.endDate)} ·{' '}
                                                {daysUntil(sub?.endDate)} দিন বাকি
                                            </Text>
                                        </>
                                    ) : isPending ? (
                                        <>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.base.fontSize,
                                                    fontFamily: typography.fontDisplay,
                                                    fontWeight: typography.weights.bold,
                                                    color: colors.warning,
                                                }}
                                            >
                                                অ্যাডমিন অনুমোদনের অপেক্ষায়
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                আপনার {PLAN_DISPLAY_LABEL[sub?.plan] || sub?.plan}{' '}
                                                প্ল্যানের আবেদন পর্যালোচনা করা হচ্ছে।
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.base.fontSize,
                                                    fontFamily: typography.fontDisplay,
                                                    fontWeight: typography.weights.bold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                কোনো সক্রিয় সাবস্ক্রিপশন নেই
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                প্রিমিয়াম ফিচার আনলক করতে ট্যাপ করে সাবস্ক্রাইব করুন।
                                            </Text>
                                        </>
                                    )}
                                </View>

                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={colors.textSecondary}
                                />
                            </View>
                        </Card>
                    </TouchableOpacity>
                </Animated.View>

                {/* Account Settings */}
                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
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
                        অ্যাকাউন্ট
                    </Text>

                    <View style={{ gap: spacing.base }}>
                        {/* Edit Profile */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditProfile' as never)}
                            activeOpacity={0.7}
                        >
                            <Card>
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
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: spacing.borderRadius.md,
                                                backgroundColor: colors.primaryLight,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="pencil"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                প্রোফাইল সম্পাদনা
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                আপনার তথ্য আপডেট করুন
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </Card>
                        </TouchableOpacity>

                        {/* Change Password */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ChangePassword' as never)}
                            activeOpacity={0.7}
                        >
                            <Card>
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
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: spacing.borderRadius.md,
                                                backgroundColor: colors.primaryLight,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="lock"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                পাসওয়ার্ড পরিবর্তন
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                আপনার পাসওয়ার্ড আপডেট করুন
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </Card>
                        </TouchableOpacity>

                        {/* History */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('History' as never)}
                            activeOpacity={0.7}
                        >
                            <Card>
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
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: spacing.borderRadius.md,
                                                backgroundColor: colors.primaryLight,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="history"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                পরীক্ষার ইতিহাস
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                আপনার পূর্বের অ্যাটেম্পট দেখুন
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </Card>
                        </TouchableOpacity>

                        {/* Subscription */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Subscription' as never)}
                            activeOpacity={0.7}
                        >
                            <Card>
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
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: spacing.borderRadius.md,
                                                backgroundColor: colors.primaryLight,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="crown"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                সাবস্ক্রিপশন
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                আপনার প্ল্যান ও বিলিং পরিচালনা করুন
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </Card>
                        </TouchableOpacity>

                        {/* Invoice History */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Invoices' as never)}
                            activeOpacity={0.7}
                        >
                            <Card>
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
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: spacing.borderRadius.md,
                                                backgroundColor: colors.primaryLight,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="receipt"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                ইনভয়েস ইতিহাস
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                আপনার পেমেন্ট রেকর্ড দেখুন
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </Card>
                        </TouchableOpacity>

                        {/* Notification Settings */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('NotificationSettings' as never)}
                            activeOpacity={0.7}
                        >
                            <Card>
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
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: spacing.borderRadius.md,
                                                backgroundColor: colors.primaryLight,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="bell-outline"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.sm.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    fontWeight: typography.weights.semibold,
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                নোটিফিকেশন সেটিংস
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: typography.scale.xs.fontSize,
                                                    fontFamily: typography.fontBody,
                                                    color: colors.textSecondary,
                                                    marginTop: spacing.xs,
                                                }}
                                            >
                                                অ্যালার্ট ও পছন্দ পরিচালনা করুন
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </Card>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    <Button
                        label="লগ আউট"
                        variant="danger"
                        size="large"
                        onPress={logout}
                        leftIcon="logout"
                    />
                </Animated.View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
