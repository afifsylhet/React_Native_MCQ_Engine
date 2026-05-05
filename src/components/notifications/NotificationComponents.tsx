import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface NotificationBadgeProps {
    count: number;
    visible?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    visible = true,
}) => {
    if (!visible || count === 0) {
        return null;
    }

    return (
        <View
            style={{
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: colors.error,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.surface,
            }}
        >
            <Text
                style={{
                    fontSize: 11,
                    fontFamily: typography.fontDisplay,
                    fontWeight: typography.weights.bold,
                    color: colors.surface,
                }}
            >
                {count > 99 ? '99+' : count}
            </Text>
        </View>
    );
};

interface NotificationToastProps {
    title: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    icon?: string;
    onDismiss?: () => void;
    action?: {
        label: string;
        onPress: () => void;
    };
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
    title,
    message,
    type = 'info',
    icon,
    onDismiss,
    action,
}) => {
    const getTypeColor = (t: string) => {
        switch (t) {
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            case 'warning':
                return colors.warning;
            case 'info':
            default:
                return colors.info;
        }
    };

    const getTypeIcon = (t: string) => {
        if (icon) return icon;
        switch (t) {
            case 'success':
                return 'check-circle-outline';
            case 'error':
                return 'alert-circle-outline';
            case 'warning':
                return 'alert-outline';
            case 'info':
            default:
                return 'information-outline';
        }
    };

    const typeColor = getTypeColor(type);
    const typeIcon = getTypeIcon(type);

    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderLeftWidth: 4,
                borderLeftColor: typeColor,
                borderRadius: spacing.borderRadius.md,
                padding: spacing.base,
                marginHorizontal: spacing.base,
                marginVertical: spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.base,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <MaterialCommunityIcons
                name={typeIcon as any}
                size={24}
                color={typeColor}
            />

            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontDisplay,
                        fontWeight: typography.weights.bold,
                        color: colors.textPrimary,
                    }}
                >
                    {title}
                </Text>
                {message && (
                    <Text
                        style={{
                            fontSize: typography.scale.xs.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                        numberOfLines={2}
                    >
                        {message}
                    </Text>
                )}
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                }}
            >
                {action && (
                    <TouchableOpacity
                        onPress={action.onPress}
                        style={{
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: typeColor,
                            }}
                        >
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                )}

                {onDismiss && (
                    <TouchableOpacity
                        onPress={onDismiss}
                        style={{
                            paddingHorizontal: spacing.sm,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color={colors.textTertiary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

interface NotificationItemProps {
    title: string;
    subtitle?: string;
    icon: string;
    color: string;
    read: boolean;
    timestamp: string;
    onPress: () => void;
    onDismiss?: () => void;
    action?: {
        label: string;
        icon: string;
        onPress: () => void;
    };
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    title,
    subtitle,
    icon,
    color,
    read,
    timestamp,
    onPress,
    onDismiss,
    action,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                backgroundColor: read ? colors.surfaceAlt : colors.surface,
                borderRadius: spacing.borderRadius.md,
                overflow: 'hidden',
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.md,
                    gap: spacing.base,
                }}
            >
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: spacing.borderRadius.md,
                        backgroundColor: `${color}20`,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={24}
                        color={color}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: spacing.xs,
                        }}
                    >
                        <Text
                            style={{
                                flex: 1,
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontDisplay,
                                fontWeight: typography.weights.bold,
                                color: colors.textPrimary,
                            }}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>

                        {!read && (
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

                    {subtitle && (
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textSecondary,
                                marginBottom: spacing.xs,
                            }}
                            numberOfLines={2}
                        >
                            {subtitle}
                        </Text>
                    )}

                    <Text
                        style={{
                            fontSize: typography.scale.xs.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textTertiary,
                        }}
                    >
                        {timestamp}
                    </Text>
                </View>

                {action && (
                    <TouchableOpacity
                        onPress={action.onPress}
                        style={{
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.sm,
                        }}
                    >
                        <MaterialCommunityIcons
                            name={action.icon as any}
                            size={20}
                            color={color}
                        />
                    </TouchableOpacity>
                )}

                {onDismiss && (
                    <TouchableOpacity
                        onPress={onDismiss}
                        style={{
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.sm,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color={colors.textTertiary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};
