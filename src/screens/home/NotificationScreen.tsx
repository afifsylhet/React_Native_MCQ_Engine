import React, { useCallback } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    Text,
    ViewStyle,
} from 'react-native';
import Animated, { FadeOutRight } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import {
    useNotifications,
    useDeleteNotification,
    useMarkAllRead,
    useMarkNotificationRead,
} from '../../hooks/useNotifications';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatRelativeDate } from '../../utils/formatters';
import { NOTIFICATION_TYPE_COLORS } from '../../utils/constants';
import { HomeStackScreenProps } from '../../navigation/types';

type NotificationScreenProps = HomeStackScreenProps<'Notifications'>;

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
    navigation,
}) => {
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNextPage,
        hasNextPage,
    } = useNotifications();
    const deleteNotificationMutation = useDeleteNotification();
    const markAllReadMutation = useMarkAllRead();
    const markNotificationReadMutation = useMarkNotificationRead();

    const handleDeleteNotification = useCallback(
        (notificationId: string) => {
            if (!notificationId) {
                return;
            }

            deleteNotificationMutation.mutate(notificationId, {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'নোটিফিকেশন মুছে ফেলা হয়েছে',
                        visibilityTime: 2000,
                    });
                },
            });
        },
        []
    );

    const handleMarkAllRead = useCallback(() => {
        markAllReadMutation.mutate(undefined, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'সব পঠিত হিসেবে চিহ্নিত করা হয়েছে',
                    visibilityTime: 2000,
                });
            },
        });
    }, []);

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    const handleOpenNotification = useCallback(
        (item: any) => {
            const notificationId = item.notificationId || item._id;
            if (!notificationId) return;

            if (!item.isRead) {
                markNotificationReadMutation.mutate(notificationId);
            }

            navigation.navigate('NotificationDetail', {
                notificationId,
                notificationType: item.type || 'system',
                notificationTitle: item.title || 'নোটিফিকেশন',
                notificationMessage: item.message || item.body || '',
                notificationCreatedAt: item.createdAt,
                notificationIsRead: !!item.isRead,
            });
        },
        [navigation, markNotificationReadMutation]
    );

    const renderNotificationRow = ({
        item,
    }: {
        item: any;
    }) => {
        const notificationKey = item.notificationId || item._id;
        const typeColor = NOTIFICATION_TYPE_COLORS[item.type] || colors.primary;

        const renderRightActions = () => (
            <TouchableOpacity
                onPress={() => handleDeleteNotification(notificationKey)}
                style={{
                    backgroundColor: colors.danger,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    borderRadius: spacing.borderRadius.md,
                    marginRight: spacing.base,
                }}
            >
                <MaterialCommunityIcons
                    name="delete"
                    size={24}
                    color={colors.textInverse}
                />
            </TouchableOpacity>
        );

        return (
            <Animated.View exiting={FadeOutRight}>
                <Swipeable renderRightActions={renderRightActions}>
                    <TouchableOpacity
                        onPress={() => handleOpenNotification(item)}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: spacing.base,
                            paddingVertical: spacing.md,
                            backgroundColor: item.isRead ? colors.surface : colors.primaryLight,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: typeColor,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: spacing.md,
                            }}
                        >
                            <Text style={{ fontSize: 24 }}>{item.icon || '🔔'}</Text>
                        </View>

                        <View style={{ flex: 1, justifyContent: 'space-between' }}>
                            <View>
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: item.isRead ? typography.weights.regular : typography.weights.bold,
                                        color: colors.textPrimary,
                                        marginBottom: spacing.xs,
                                    }}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                    numberOfLines={2}
                                >
                                    {item.message || item.body}
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textTertiary,
                                    marginTop: spacing.xs,
                                }}
                            >
                                {formatRelativeDate(item.createdAt)}
                            </Text>
                        </View>

                        {!item.isRead && (
                            <View
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: colors.primary,
                                    marginLeft: spacing.md,
                                    marginTop: spacing.sm,
                                }}
                            />
                        )}
                    </TouchableOpacity>
                </Swipeable>
            </Animated.View>
        );
    };

    if (isLoading && notifications.length === 0) {
        return (
            <ScreenWrapper>
                <SkeletonCard count={5} />
            </ScreenWrapper>
        );
    }

    if (notifications.length === 0) {
        return (
            <ScreenWrapper>
                <EmptyState
                    icon="bell-off"
                    title="কোনো নোটিফিকেশন নেই"
                    subtitle="সব আপডেট দেখা হয়ে গেছে!"
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable={false}>
            <View style={{ flex: 1, backgroundColor: colors.surface }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale.lg.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                        }}
                    >
                        নোটিফিকেশন
                    </Text>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.primary,
                                fontWeight: typography.weights.semibold,
                            }}
                        >
                            সব পঠিত {unreadCount > 0 ? `(${unreadCount})` : ''}
                        </Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={notifications}
                    renderItem={renderNotificationRow}
                    keyExtractor={(item, index) =>
                        item.notificationId || item._id || `notification-${index}`
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoading ? <SkeletonCard height={60} /> : null
                    }
                />
            </View>
        </ScreenWrapper>
    );
};
