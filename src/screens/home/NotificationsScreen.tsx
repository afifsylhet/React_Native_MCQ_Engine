import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SectionList,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { HomeStackScreenProps } from '../../navigation/types';
import { formatRelativeTime } from '../../utils/formatters';
import { useNotifications, useMarkAllRead } from '../../hooks/useNotifications';
import { Notification } from '../../types/api.types';

type NotificationsScreenProps = HomeStackScreenProps<'Notifications'>;

interface NotificationSection {
    title: string;
    data: Notification[];
}

const getNotificationColor = (type: string): string => {
    switch (type) {
        case 'exam':
        case 'performance':
            return colors.success;
        case 'achievement':
            return colors.accent;
        case 'subscription':
            return colors.info;
        case 'system':
            return colors.warning;
        default:
            return colors.primary;
    }
};

const getNotificationIcon = (type: string): string => {
    switch (type) {
        case 'exam':
            return 'checkbox-marked-circle-outline';
        case 'performance':
            return 'chart-line';
        case 'achievement':
            return 'medal-outline';
        case 'subscription':
            return 'card-account-details-outline';
        case 'system':
            return 'bell-ring-outline';
        default:
            return 'bell-outline';
    }
};

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
    navigation,
}) => {
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNextPage,
        hasNextPage,
    } = useNotifications();
    const markAllRead = useMarkAllRead();

    const sections: NotificationSection[] = useMemo(() => {
        const result: NotificationSection[] = [];
        const unread = notifications.filter((n) => !n.isRead);
        const read = notifications.filter((n) => n.isRead);
        if (unread.length > 0) {
            result.push({ title: `অপঠিত (${unread.length})`, data: unread });
        }
        if (read.length > 0) {
            result.push({ title: 'পূর্বের', data: read });
        }
        return result;
    }, [notifications]);

    const handleNotificationPress = (notification: Notification) => {
        navigation.navigate('NotificationDetail', {
            notificationId: notification.notificationId,
            notificationType: notification.type as any,
        });
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const iconColor = getNotificationColor(item.type);
        const iconName = item.icon || getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <Card
                    style={{
                        marginVertical: spacing.xs,
                        opacity: item.isRead ? 0.7 : 1,
                        backgroundColor: item.isRead
                            ? colors.surfaceAlt
                            : colors.surface,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.base,
                        }}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: spacing.borderRadius.md,
                                backgroundColor: `${iconColor}20`,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <MaterialCommunityIcons
                                name={iconName as any}
                                size={24}
                                color={iconColor}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.textPrimary,
                                        flex: 1,
                                    }}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                {!item.isRead && (
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: colors.primary,
                                            marginLeft: spacing.xs,
                                        }}
                                    />
                                )}
                            </View>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    marginTop: spacing.xs,
                                }}
                                numberOfLines={2}
                            >
                                {item.message}
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textTertiary,
                                    marginTop: spacing.xs,
                                }}
                            >
                                {formatRelativeTime(item.createdAt)}
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

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

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <Animated.View
                entering={FadeInDown}
                style={{
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.surfaceAlt,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
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
                        নোটিফিকেশন
                    </Text>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            onPress={() => markAllRead.mutate()}
                            disabled={markAllRead.isPending}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.primary,
                                }}
                            >
                                সব পঠিত হিসেবে চিহ্নিত করুন
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.delay(100)}
                style={{ flex: 1, paddingHorizontal: spacing.base }}
            >
                {sections.length > 0 ? (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.notificationId}
                        renderItem={renderNotificationItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontDisplay,
                                    fontWeight: typography.weights.bold,
                                    color: colors.textTertiary,
                                    textTransform: 'uppercase',
                                    marginTop: spacing.md,
                                    marginBottom: spacing.sm,
                                }}
                            >
                                {title}
                            </Text>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: spacing.lg }}
                        onEndReached={() => {
                            if (hasNextPage) fetchNextPage();
                        }}
                        onEndReachedThreshold={0.5}
                    />
                ) : (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: spacing.md,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="bell-off-outline"
                            size={48}
                            color={colors.textTertiary}
                        />
                        <Text
                            style={{
                                fontSize: typography.scale.base.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: colors.textSecondary,
                            }}
                        >
                            কোনো নোটিফিকেশন নেই
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textTertiary,
                                textAlign: 'center',
                            }}
                        >
                            সব আপডেট দেখা হয়ে গেছে! এই মুহূর্তে নতুন কিছু নেই।
                        </Text>
                    </View>
                )}
            </Animated.View>
        </ScreenWrapper>
    );
};
