import React, { useMemo } from 'react';
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
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { HomeStackScreenProps } from '../../navigation/types';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useNotifications, useMarkNotificationRead } from '../../hooks/useNotifications';

type NotificationDetailScreenProps = HomeStackScreenProps<'NotificationDetail'>;

const getTypeIcon = (type?: string) => {
    switch (type) {
        case 'exam_result':
        case 'exam':
            return 'checkbox-marked-circle-outline';
        case 'achievement':
            return 'medal-outline';
        case 'reminder':
            return 'bell-ring-outline';
        case 'leaderboard':
            return 'trophy-outline';
        case 'subscription':
            return 'card-account-details-outline';
        case 'notice':
            return 'bullhorn-outline';
        case 'system':
            return 'information-outline';
        case 'promo':
            return 'gift-outline';
        default:
            return 'information-outline';
    }
};

const getTypeBadge = (type?: string) => {
    switch (type) {
        case 'exam_result':
        case 'exam':
            return { text: 'পরীক্ষা', color: 'success' as const };
        case 'achievement':
            return { text: 'অর্জন', color: 'warning' as const };
        case 'reminder':
            return { text: 'রিমাইন্ডার', color: 'info' as const };
        case 'leaderboard':
            return { text: 'লিডারবোর্ড', color: 'primary' as const };
        case 'subscription':
            return { text: 'সাবস্ক্রিপশন', color: 'warning' as const };
        case 'notice':
            return { text: 'নোটিশ', color: 'info' as const };
        case 'promo':
            return { text: 'অফার', color: 'success' as const };
        default:
            return { text: 'নোটিফিকেশন', color: 'primary' as const };
    }
};

export const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({
    navigation,
    route,
}) => {
    const {
        notificationId,
        notificationType,
        notificationTitle,
        notificationMessage,
        notificationCreatedAt,
        notificationIsRead,
    } = route.params;

    const { notifications } = useNotifications();
    const markReadMutation = useMarkNotificationRead();

    const notification = useMemo(() => {
        const found = notifications.find((item: any) => {
            return item.notificationId === notificationId || item._id === notificationId;
        });

        if (found) {
            return {
                id: found.notificationId || found._id,
                type: found.type || notificationType,
                title: found.title || notificationTitle || 'নোটিফিকেশন',
                message: found.message || found.body || notificationMessage || '',
                createdAt: found.createdAt || notificationCreatedAt,
                isRead: !!found.isRead,
            };
        }

        return {
            id: notificationId,
            type: notificationType,
            title: notificationTitle || 'নোটিফিকেশন',
            message: notificationMessage || '',
            createdAt: notificationCreatedAt,
            isRead: !!notificationIsRead,
        };
    }, [
        notifications,
        notificationId,
        notificationType,
        notificationTitle,
        notificationMessage,
        notificationCreatedAt,
        notificationIsRead,
    ]);

    const handleMarkAsRead = () => {
        if (!notification?.id || notification.isRead) return;
        markReadMutation.mutate(notification.id);
    };

    if (!notification || (!notification.title && !notification.message)) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <EmptyState
                    icon="bell-off"
                    title="নোটিফিকেশন পাওয়া যায়নি"
                    subtitle="এই নোটিফিকেশনটি আর উপলব্ধ নেই।"
                />
            </ScreenWrapper>
        );
    }

    const typeIcon = getTypeIcon(notification.type);
    const typeBadge = getTypeBadge(notification.type);

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                        নোটিফিকেশন
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(100)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    <Card>
                        <View style={{ gap: spacing.lg }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    gap: spacing.base,
                                }}
                            >
                                <View
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: spacing.borderRadius.lg,
                                        backgroundColor: colors.primaryLight,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={typeIcon}
                                        size={28}
                                        color={colors.primary}
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <View
                                        style={{
                                            alignSelf: 'flex-start',
                                            backgroundColor: colors.surfaceAlt,
                                            paddingHorizontal: spacing.sm,
                                            paddingVertical: 4,
                                            borderRadius: spacing.borderRadius.full,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            {typeBadge.text}
                                        </Text>
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: typography.scale.lg.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.textPrimary,
                                            marginTop: spacing.base,
                                        }}
                                    >
                                        {notification.title}
                                    </Text>
                                </View>
                            </View>

                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textPrimary,
                                    lineHeight: typography.scale.sm.fontSize * 1.5,
                                }}
                            >
                                {notification.message || 'এই নোটিফিকেশনে অতিরিক্ত বার্তা নেই।'}
                            </Text>

                            {!!notification.createdAt && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                        paddingTop: spacing.md,
                                        borderTopWidth: 1,
                                        borderTopColor: colors.surfaceAlt,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={18}
                                        color={colors.textSecondary}
                                    />
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            {formatDate(notification.createdAt)}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textTertiary,
                                                marginTop: spacing.xs,
                                            }}
                                        >
                                            {formatRelativeTime(notification.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingBottom: spacing.lg,
                    }}
                >
                    <Button
                        label={notification.isRead ? 'পঠিত হয়েছে' : 'পঠিত হিসেবে চিহ্নিত করুন'}
                        variant="secondary"
                        size="large"
                        onPress={handleMarkAsRead}
                        disabled={markReadMutation.isPending || notification.isRead}
                        leftIcon="check"
                    />
                </Animated.View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
